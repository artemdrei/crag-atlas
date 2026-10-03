import { describe, expect, it } from 'vitest';

import type { HourInput } from './conditions.scoring';
import {
  bandOf,
  bestWindow,
  rainScore,
  scoreHour,
  sunShadeScore
} from './conditions.scoring';

const hour = (overrides: Partial<HourInput> = {}): HourInput => ({
  temperatureC: 15,
  humidityPct: 55,
  windSpeedMs: 2,
  precipitationMm: 0,
  precipitation24hMm: 0,
  weatherCode: 0,
  hoursSinceRain: null,
  isSun: false,
  ...overrides
});

describe('rain', () => {
  it('takes the worse of what falls now and what fell lately', () => {
    expect(rainScore(hour({ hoursSinceRain: 1 }), 'open')).toBe(10);
    expect(
      rainScore(hour({ precipitationMm: 1, hoursSinceRain: 0 }), 'open')
    ).toBe(0);
    expect(rainScore(hour({ hoursSinceRain: 30 }), 'open')).toBe(100);
  });

  it('keeps a sheltered wall climbable in the rain', () => {
    const pouring = hour({ precipitationMm: 2, hoursSinceRain: 0 });

    expect(rainScore(pouring, 'open')).toBe(0);
    expect(rainScore(pouring, 'partial')).toBe(60);
    expect(rainScore(pouring, 'full')).toBe(95);
  });

  it('lets a roof seep after a long soaking', () => {
    const afterDays = hour({
      precipitationMm: 2,
      precipitation24hMm: 45,
      hoursSinceRain: 0
    });

    expect(rainScore(afterDays, 'full')).toBe(50);
  });
});

describe('sun and shade', () => {
  it('turns on the temperature, not on the sun alone', () => {
    expect(sunShadeScore(2, true, 'open')).toBe(100);
    expect(sunShadeScore(2, false, 'open')).toBe(50);
    expect(sunShadeScore(30, true, 'open')).toBe(15);
    expect(sunShadeScore(30, false, 'open')).toBe(85);
  });

  it('scores a deep roof as shade however the sun falls on the face', () => {
    expect(sunShadeScore(30, true, 'full')).toBe(85);
  });
});

describe('hard caps', () => {
  it('holds an open crag in real rain down however good the rest is', () => {
    const perfectButWet = hour({
      temperatureC: 14,
      humidityPct: 50,
      precipitationMm: 1.2,
      hoursSinceRain: 0,
      weatherCode: 63
    });

    const { score, cappedBy } = scoreHour(perfectButWet, 'open');

    expect(score).toBeLessThanOrEqual(20);
    expect(cappedBy).toBe('heavy_rain');
  });

  it('does not hold a cave down for rain that never reaches it', () => {
    const inTheCave = scoreHour(
      hour({
        temperatureC: 14,
        precipitationMm: 1.2,
        hoursSinceRain: 0,
        weatherCode: 63
      }),
      'full'
    );

    expect(inTheCave.cappedBy).toBeNull();
    expect(inTheCave.score).toBeGreaterThan(20);
  });
});

describe('bands', () => {
  it('reads the score the way the card labels it', () => {
    expect(bandOf(95)).toBe('excellent');
    expect(bandOf(80)).toBe('good');
    expect(bandOf(60)).toBe('ok');
    expect(bandOf(40)).toBe('poor');
    expect(bandOf(10)).toBe('bad');
  });
});

describe('best window', () => {
  const empty = Array.from({ length: 24 }, () => null) as (number | null)[];

  it('picks the run a climber would pick', () => {
    const day = [...empty];

    day[8] = 60;
    day[9] = 90;
    day[10] = 92;
    day[11] = 91;
    day[12] = 50;

    expect(bestWindow(day)).toEqual({
      fromHour: 9,
      untilHour: 12,
      score: 91
    });
  });

  it('names no window on a day nobody should climb', () => {
    const day = [...empty];

    day[10] = 20;
    day[11] = 25;

    expect(bestWindow(day)).toBeNull();
  });
});
