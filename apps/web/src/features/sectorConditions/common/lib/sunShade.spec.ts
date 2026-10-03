import { describe, expect, it } from 'vitest';

import type { ConditionsDay } from '../entities';
import { sunShadeOf } from './sunShade';

const day = (overrides: Partial<ConditionsDay>): ConditionsDay =>
  ({
    date: '2026-10-03',
    hasForecast: true,
    score: 80,
    band: 'good',
    bestFromAt: null,
    bestUntilAt: null,
    sunriseAt: '07:10',
    sunsetAt: '18:40',
    sunIntervals: [],
    hours: [],
    ...overrides
  }) as ConditionsDay;

describe('sun and shade', () => {
  it('names the edges of the sun', () => {
    const summary = sunShadeOf(
      day({ sunIntervals: [{ fromAt: '08:40', untilAt: '13:25' }] })
    );

    expect(summary.firstSunAt).toBe('08:40');
    expect(summary.lastSunAt).toBe('13:25');
    expect(summary.isAllDay).toBe(false);
    expect(summary.isNever).toBe(false);
  });

  it('reads sunrise to sunset as all day', () => {
    expect(
      sunShadeOf(day({ sunIntervals: [{ fromAt: '07:10', untilAt: '18:40' }] }))
        .isAllDay
    ).toBe(true);
  });

  it('reads a wall the sun never reaches as never', () => {
    expect(sunShadeOf(day({})).isNever).toBe(true);
  });
});
