import { Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  AppException,
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import type { DatabaseError } from '../common/exceptions/database.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { Coords } from '../common/utils/point';
import { publicSupabase } from '../config/supabase.client';
import {
  observedHour,
  type TickWeatherRow,
  toWeatherColumns,
  type WeatherEntry
} from './weather.mapper';
import type { TickWeatherDto, WeatherLookupDto } from './weather.types';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

const HOURLY = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'precipitation',
  'cloud_cover',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m'
].join(',');

// Open-Meteo's forecast window is about 92 days back and 16 ahead, and it
// moves with the clock — the margin keeps a request off its edge.
const FORECAST_DAYS_BACK = 85;
const FORECAST_DAYS_AHEAD = 14;

const FRESH_MS = 15 * 60 * 1000;
const CACHE_SIZE = 500;

const AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

interface OpenMeteoDay {
  time: string[];
  temperature: (number | null)[];
  apparent: (number | null)[];
  humidity: (number | null)[];
  dewPoint: (number | null)[];
  precipitation: (number | null)[];
  cloudCover: (number | null)[];
  weatherCode: (number | null)[];
  windSpeed: (number | null)[];
  windGust: (number | null)[];
  sunrise: string | null;
  sunset: string | null;
}

interface CacheEntry {
  day: OpenMeteoDay;
  expiresAt: number;
}

interface OpenMeteoResponse {
  error?: boolean;
  reason?: string;
  hourly?: Record<string, (number | null)[] | string[]>;
  daily?: { time: string[]; sunrise: string[]; sunset: string[] };
}

@Injectable()
export class WeatherService {
  private readonly cache = new Map<string, CacheEntry>();

  async lookupByRoute(idRoute: string, at: string): Promise<WeatherLookupDto> {
    assertAt(at);

    const { data, error } = await publicSupabase()
      .from('routes')
      .select('sectors (lat, lng)')
      .eq('id', idRoute)
      .maybeSingle<{ sectors: Coords | null }>();

    if (error) {
      throw readFailed(
        'Could not load the route',
        'WEATHER_ROUTE_READ_FAILED',
        error
      );
    }

    if (!data) throw new NotFoundException('Route not found');

    const { lat, lng } = data.sectors ?? {};

    if (lat == null || lng == null) {
      return { hasPoint: false, weather: null };
    }

    return { hasPoint: true, weather: await this.at(lat, lng, at) };
  }

  async at(lat: number, lng: number, at: string): Promise<TickWeatherDto> {
    const date = at.slice(0, 10);
    const observedAt = observedHour(date, at.slice(11));
    const day = await this.day(lat, lng, date);
    const index = day.time.indexOf(observedAt);

    if (index < 0) {
      throw new AppException(
        `Open-Meteo answered without the hour ${observedAt}`,
        502,
        'WEATHER_HOUR_MISSING'
      );
    }

    return {
      observedAt,
      lat,
      lng,
      temperatureC: round(day.temperature[index], 1),
      apparentTemperatureC: round(day.apparent[index], 1),
      dewPointC: round(day.dewPoint[index], 1),
      humidityPct: round(day.humidity[index], 0),
      windSpeedMs: round(day.windSpeed[index], 1),
      windGustMs: round(day.windGust[index], 1),
      precipitationMm: round(day.precipitation[index], 1),
      precipitation24hMm: round(sumLast24h(day.precipitation, index), 1),
      cloudCoverPct: round(day.cloudCover[index], 0),
      weatherCode: round(day.weatherCode[index], 0),
      sunrise: day.sunrise,
      sunset: day.sunset,
      isManual: false
    };
  }

  // The day before comes along because the 24 hour rain total reaches back
  // across midnight.
  private async day(
    lat: number,
    lng: number,
    date: string
  ): Promise<OpenMeteoDay> {
    const key = `${lat.toFixed(3)}|${lng.toFixed(3)}|${date}`;
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) return cached.day;

    const from = shiftDate(date, -1);
    const today = new Date().toISOString().slice(0, 10);

    if (date > shiftDate(today, FORECAST_DAYS_AHEAD)) {
      throw new ValidationException(
        'No weather is published that far ahead',
        'WEATHER_DATE_UNAVAILABLE'
      );
    }

    const url = new URL(
      from < shiftDate(today, -FORECAST_DAYS_BACK) ? ARCHIVE_URL : FORECAST_URL
    );

    url.search = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      hourly: HOURLY,
      daily: 'sunrise,sunset',
      // Answers in the crag's own zone, so the hour is matched as a string
      // and no offset arithmetic is needed anywhere.
      timezone: 'auto',
      wind_speed_unit: 'ms',
      start_date: from,
      end_date: date
    }).toString();

    const day = parseDay(await request(url), date);

    if (this.cache.size >= CACHE_SIZE) {
      const oldest = this.cache.keys().next().value;

      if (oldest) this.cache.delete(oldest);
    }

    this.cache.set(key, {
      day,
      // Yesterday by the server's clock, not today's: a crag east of here is
      // already on the next date, and its forecast must not be kept forever.
      expiresAt:
        date < shiftDate(today, -1)
          ? Number.POSITIVE_INFINITY
          : Date.now() + FRESH_MS
    });

    return day;
  }

  async save(
    client: SupabaseClient,
    entry: WeatherEntry
  ): Promise<TickWeatherRow> {
    const { data, error } = await client
      .from('tick_weather')
      .upsert(toWeatherColumns(entry), { onConflict: 'id_tick' })
      .select('*')
      .single<TickWeatherRow>();

    if (error) throw saveFailed(error);

    return data;
  }

  async saveMany(client: SupabaseClient, entries: WeatherEntry[]) {
    if (entries.length === 0) return;

    const { error } = await client
      .from('tick_weather')
      .upsert(entries.map(toWeatherColumns), { onConflict: 'id_tick' });

    if (error) throw saveFailed(error);
  }

  async clear(client: SupabaseClient, idTick: string) {
    const { error } = await client
      .from('tick_weather')
      .delete()
      .eq('id_tick', idTick);

    if (error) {
      throw writeFailed(
        'Could not clear the conditions',
        'TICK_WEATHER_SAVE_FAILED',
        error
      );
    }
  }
}

const saveFailed = (cause?: DatabaseError) =>
  writeFailed(
    'Could not save the conditions',
    'TICK_WEATHER_SAVE_FAILED',
    cause
  );

const request = async (url: URL): Promise<OpenMeteoResponse> => {
  let response: Response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch (cause) {
    throw new AppException(
      `Open-Meteo is unreachable: ${String(cause)}`,
      502,
      'WEATHER_FETCH_FAILED'
    );
  }

  const body = (await response.json()) as OpenMeteoResponse;

  if (!response.ok || body.error) {
    throw new AppException(
      `Open-Meteo refused the request: ${body.reason ?? response.status}`,
      502,
      'WEATHER_FETCH_FAILED'
    );
  }

  return body;
};

const parseDay = (body: OpenMeteoResponse, date: string): OpenMeteoDay => {
  const hourly = body.hourly;

  if (!hourly?.time) {
    throw new AppException(
      'Open-Meteo answered without an hourly series',
      502,
      'WEATHER_FETCH_FAILED'
    );
  }

  const numbers = (name: string) => (hourly[name] ?? []) as (number | null)[];
  const daily = body.daily;
  const times = daily?.time ?? [];

  return {
    time: hourly.time as string[],
    temperature: numbers('temperature_2m'),
    apparent: numbers('apparent_temperature'),
    humidity: numbers('relative_humidity_2m'),
    dewPoint: numbers('dew_point_2m'),
    precipitation: numbers('precipitation'),
    cloudCover: numbers('cloud_cover'),
    weatherCode: numbers('weather_code'),
    windSpeed: numbers('wind_speed_10m'),
    windGust: numbers('wind_gusts_10m'),
    sunrise: clockOn(date, times, daily?.sunrise),
    sunset: clockOn(date, times, daily?.sunset)
  };
};

// Above the Arctic circle the sun may not set that day at all, and the answer
// then carries the next day's date — which would read as a sunset long gone.
const clockOn = (
  date: string,
  dates: string[],
  values?: string[]
): string | null => {
  const value = values?.[dates.indexOf(date)] ?? '';

  return value.startsWith(date) ? value.slice(11, 16) : null;
};

const sumLast24h = (
  values: (number | null)[],
  index: number
): number | null => {
  const window = values.slice(Math.max(0, index - 23), index + 1);
  const known = window.filter((value): value is number => value !== null);

  return known.length === 0
    ? null
    : known.reduce((total, value) => total + value, 0);
};

const round = (value: number | null | undefined, digits: number) =>
  value === null || value === undefined ? null : Number(value.toFixed(digits));

const shiftDate = (date: string, days: number): string => {
  const value = new Date(`${date}T00:00:00Z`);

  value.setUTCDate(value.getUTCDate() + days);

  return value.toISOString().slice(0, 10);
};

const assertAt = (at: string) => {
  if (!AT_PATTERN.test(at)) {
    throw new ValidationException(
      'An `at` must look like 2026-10-01T16:00',
      'WEATHER_AT_INVALID'
    );
  }
};
