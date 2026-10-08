import type { TickWeather } from '@crag-atlas/api';

import type { Coords, ForecastDay } from '@web/shared/types';

// `at` is already floored to the hour, the way the series is keyed.
export const tickWeatherAt = (
  day: ForecastDay,
  { lat, lng }: Coords,
  at: string
): TickWeather | null => {
  const index = day.time.indexOf(at);

  if (index < 0) return null;

  return {
    observedAt: at,
    lat,
    lng,
    temperatureC: round(day.temperatureC[index], 1),
    apparentTemperatureC: round(day.apparentTemperatureC[index], 1),
    dewPointC: round(day.dewPointC[index], 1),
    humidityPct: round(day.humidityPct[index], 0),
    windSpeedMs: round(day.windSpeedMs[index], 1),
    windGustMs: round(day.windGustMs[index], 1),
    precipitationMm: round(day.precipitationMm[index], 1),
    precipitation24hMm: round(sumLast24h(day.precipitationMm, index), 1),
    cloudCoverPct: round(day.cloudCoverPct[index], 0),
    weatherCode: round(day.weatherCode[index], 0),
    sunrise: day.sunrise,
    sunset: day.sunset,
    source: day.source,
    isManual: false
  };
};

const sumLast24h = (
  values: (number | null)[],
  index: number
): number | null => {
  const known = values
    .slice(Math.max(0, index - 23), index + 1)
    .filter((value): value is number => value !== null);

  return known.length === 0
    ? null
    : known.reduce((total, value) => total + value, 0);
};

const round = (value: number | null | undefined, digits: number) =>
  value == null ? null : Number(value.toFixed(digits));
