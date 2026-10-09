import { describe, expect, it } from 'vitest';

import type { ConditionsHour } from '../entities';
import { dominantWeatherKind } from './dominantWeatherKind';

const hour = (
  weatherCode: number | null,
  precipitationMm: number | null = 0
): ConditionsHour => ({
  at: '12:00',
  isSun: true,
  score: null,
  band: null,
  temperatureC: null,
  precipitationMm,
  humidityPct: null,
  windSpeedMs: null,
  weatherCode
});

describe('dominantWeatherKind', () => {
  it('picks the sky most hours had', () => {
    expect(
      dominantWeatherKind([hour(3), hour(61, 1), hour(61, 1), hour(0)])
    ).toBe('rain');
  });

  it('keeps the first of a tie', () => {
    expect(dominantWeatherKind([hour(3), hour(0)])).toBe('cloudy');
  });

  it('is nothing without a forecast', () => {
    expect(dominantWeatherKind([hour(null), hour(null)])).toBeNull();
  });
});
