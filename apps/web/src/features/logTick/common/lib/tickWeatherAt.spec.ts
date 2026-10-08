import { describe, expect, it } from 'vitest';

import type { ForecastDay } from '@web/shared/types';

import { tickWeatherAt } from './tickWeatherAt';

const hours = (date: string) =>
  Array.from(
    { length: 24 },
    (_, hour) => `${date}T${String(hour).padStart(2, '0')}:00`
  );

const dayOf = (rainMm: number): ForecastDay => {
  const time = [...hours('2026-09-30'), ...hours('2026-10-01')];
  const filled = (value: number) => time.map(() => value);

  return {
    source: 'open-meteo',
    time,
    temperatureC: filled(18.04),
    apparentTemperatureC: filled(17),
    dewPointC: filled(4),
    humidityPct: filled(40.4),
    windSpeedMs: filled(2.26),
    windGustMs: filled(5),
    precipitationMm: filled(rainMm),
    cloudCoverPct: filled(10),
    weatherCode: filled(1),
    sunrise: '07:02',
    sunset: '18:48'
  };
};

describe('tickWeatherAt', () => {
  it('reads the hour of the ascent with the rain of the day before it', () => {
    expect(
      tickWeatherAt(dayOf(0.5), { lat: 46.5, lng: 14 }, '2026-10-01T16:00')
    ).toMatchObject({
      observedAt: '2026-10-01T16:00',
      lat: 46.5,
      lng: 14,
      temperatureC: 18,
      humidityPct: 40,
      windSpeedMs: 2.3,
      precipitation24hMm: 12,
      sunrise: '07:02',
      sunset: '18:48',
      source: 'open-meteo',
      isManual: false
    });
  });

  it('has no reading for an hour the forecast does not cover', () => {
    expect(
      tickWeatherAt(dayOf(0), { lat: 46.5, lng: 14 }, '2026-10-02T09:00')
    ).toBeNull();
  });
});
