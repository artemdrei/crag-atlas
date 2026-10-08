import type { Forecast, WeatherSource } from '@crag-atlas/api';
import { domainFailure, wrapApiCall } from '@crag-atlas/utils';

import type { Coords, ForecastDay } from '@web/shared/types';

// Requested from the browser on purpose. The free tier limits calls per IP,
// and our server shares one outbound IP with every app on its host, so they
// all spend the same quota. From the browser, each user has their own.
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
// The forecast API only reaches about 90 days back; older ascents are read
// from the historical archive.
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export const OPEN_METEO: WeatherSource = 'open-meteo';

// Open-Meteo's forecast window is about 92 days back and 16 ahead, and it
// moves with the clock — the margin keeps a request off its edge.
const FORECAST_DAYS_BACK = 85;
const FORECAST_DAYS_AHEAD = 14;

type Series = (number | null)[];

interface OpenMeteoBody {
  error?: boolean;
  reason?: string;
  utc_offset_seconds?: number;
  hourly?: Record<string, string[] | Series>;
  daily?: { time: string[]; sunrise: string[]; sunset: string[] };
}

// The strip reads today from hour 24, so the series opens on the day before.
export const getForecastWindow = async ({
  lat,
  lng
}: Coords): Promise<Forecast> => {
  const body = await requestForecast(FORECAST_URL, {
    latitude: String(lat),
    longitude: String(lng),
    hourly:
      'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    timezone: 'auto',
    wind_speed_unit: 'ms',
    past_days: '1',
    forecast_days: '16'
  });
  const series = seriesOf(body);

  return {
    utcOffsetSeconds: body.utc_offset_seconds ?? 0,
    time: timeOf(body),
    temperatureC: series('temperature_2m'),
    humidityPct: series('relative_humidity_2m'),
    precipitationMm: series('precipitation'),
    weatherCode: series('weather_code'),
    windSpeedMs: series('wind_speed_10m')
  };
};

// The day before comes along because the 24 hour rain total reaches back
// across midnight.
export const getForecastDay = async (
  { lat, lng }: Coords,
  date: string
): Promise<ForecastDay> => {
  const today = new Date().toISOString().slice(0, 10);
  const from = shiftDate(date, -1);

  if (date > shiftDate(today, FORECAST_DAYS_AHEAD)) {
    throw domainFailure(
      'WEATHER_DATE_UNAVAILABLE',
      'No weather is published that far ahead'
    );
  }

  const body = await requestForecast(
    from < shiftDate(today, -FORECAST_DAYS_BACK) ? ARCHIVE_URL : FORECAST_URL,
    {
      latitude: String(lat),
      longitude: String(lng),
      hourly:
        'temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,precipitation,cloud_cover,weather_code,wind_speed_10m,wind_gusts_10m',
      daily: 'sunrise,sunset',
      // Answers in the crag's own zone, so the hour is matched as a string
      // and no offset arithmetic is needed anywhere.
      timezone: 'auto',
      wind_speed_unit: 'ms',
      start_date: from,
      end_date: date
    }
  );
  const series = seriesOf(body);

  return {
    source: OPEN_METEO,
    time: timeOf(body),
    temperatureC: series('temperature_2m'),
    apparentTemperatureC: series('apparent_temperature'),
    dewPointC: series('dew_point_2m'),
    humidityPct: series('relative_humidity_2m'),
    windSpeedMs: series('wind_speed_10m'),
    windGustMs: series('wind_gusts_10m'),
    precipitationMm: series('precipitation'),
    cloudCoverPct: series('cloud_cover'),
    weatherCode: series('weather_code'),
    sunrise: clockOn(date, body.daily?.time, body.daily?.sunrise),
    sunset: clockOn(date, body.daily?.time, body.daily?.sunset)
  };
};

const requestForecast = (base: string, params: Record<string, string>) =>
  wrapApiCall(`openMeteo:${base}`, async (): Promise<OpenMeteoBody> => {
    const response = await fetch(`${base}?${new URLSearchParams(params)}`);
    const body = (await response
      .json()
      .catch(() => null)) as OpenMeteoBody | null;

    if (!response.ok || !body || body.error || !body.hourly) {
      throw domainFailure(
        'WEATHER_FETCH_FAILED',
        `Open-Meteo refused the request: ${body?.reason ?? response.status}`,
        { status: response.status }
      );
    }

    return body;
  });

const timeOf = (body: OpenMeteoBody) => (body.hourly?.time ?? []) as string[];

const seriesOf =
  (body: OpenMeteoBody) =>
  (name: string): Series =>
    (body.hourly?.[name] ?? timeOf(body).map(() => null)) as Series;

// Above the Arctic circle the sun may not set that day at all, and the answer
// then carries the next day's date — which would read as a sunset long gone.
const clockOn = (
  date: string,
  dates: string[] = [],
  values: string[] = []
): string | null => {
  const value = values[dates.indexOf(date)] ?? '';

  return value.startsWith(date) ? value.slice(11, 16) : null;
};

const shiftDate = (date: string, days: number): string => {
  const value = new Date(`${date}T00:00:00Z`);

  value.setUTCDate(value.getUTCDate() + days);

  return value.toISOString().slice(0, 10);
};
