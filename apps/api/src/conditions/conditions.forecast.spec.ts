import { describe, expect, it } from 'vitest';

import { ValidationException } from '../common/exceptions/app.exception';
import { assertForecast } from './conditions.forecast';
import type { ForecastDto } from './conditions.types';

const forecastOf = (hours: number): ForecastDto => {
  const time = Array.from({ length: hours }, (_, index) => {
    const day = String(1 + Math.floor(index / 24)).padStart(2, '0');
    const hour = String(index % 24).padStart(2, '0');

    return `2026-10-${day}T${hour}:00`;
  });
  const filled = () => time.map(() => 1);

  return {
    utcOffsetSeconds: 7200,
    time,
    temperatureC: filled(),
    humidityPct: filled(),
    precipitationMm: filled(),
    weatherCode: filled(),
    windSpeedMs: filled()
  };
};

describe('assertForecast', () => {
  it('accepts the day before and sixteen ahead', () => {
    const forecast = forecastOf(24 * 17);

    expect(assertForecast(forecast)).toBe(forecast);
  });

  it('refuses a series that does not line up with the hours', () => {
    const forecast = forecastOf(48);

    forecast.precipitationMm.pop();

    expect(() => assertForecast(forecast)).toThrow(ValidationException);
  });

  it('refuses a series that is not numbers', () => {
    const forecast = forecastOf(48);

    (forecast.temperatureC as unknown[])[3] = '18';

    expect(() => assertForecast(forecast)).toThrow(ValidationException);
  });

  it('refuses more hours than any forecast publishes', () => {
    expect(() => assertForecast(forecastOf(24 * 19))).toThrow(
      ValidationException
    );
  });
});
