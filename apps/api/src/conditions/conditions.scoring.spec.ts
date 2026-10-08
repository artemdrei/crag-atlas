import { describe, expect, it } from 'vitest';

import type { HourInput } from './conditions.scoring';
import {
  bandOf,
  bestWindow,
  dayScore,
  dryingMm,
  rainScore,
  scoreHour,
  sunShadeScore
} from './conditions.scoring';

const hour = (overrides: Partial<HourInput> = {}): HourInput => ({
  temperatureC: 12,
  humidityPct: 50,
  windSpeedMs: 2,
  precipitationMm: 0,
  precipitation24hMm: 0,
  weatherCode: 0,
  wetnessMm: 0,
  isSun: false,
  ...overrides
});

describe('rain', () => {
  it('takes the worse of what falls now and what is still on the rock', () => {
    expect(rainScore(hour({ wetnessMm: 1.5 }), 'open')).toBe(30);
    expect(rainScore(hour({ precipitationMm: 1, wetnessMm: 1 }), 'open')).toBe(
      0
    );
    expect(rainScore(hour({ wetnessMm: 0 }), 'open')).toBe(100);
  });

  it('dries faster in wind and slower in damp cold air', () => {
    expect(
      dryingMm({ temperatureC: 15, humidityPct: 55, windSpeedMs: 2 })
    ).toBe(0.5);
    expect(
      dryingMm({ temperatureC: 15, humidityPct: 55, windSpeedMs: 6 })
    ).toBe(0.65);
    expect(
      dryingMm({ temperatureC: 3, humidityPct: 90, windSpeedMs: 2 })
    ).toBeCloseTo(0.15);
  });

  it('keeps a sheltered wall climbable in the rain', () => {
    const pouring = hour({ precipitationMm: 2, wetnessMm: 2 });

    expect(rainScore(pouring, 'open')).toBe(0);
    expect(rainScore(pouring, 'partial')).toBe(60);
    expect(rainScore(pouring, 'full')).toBe(95);
  });

  it('lets a roof seep after a long soaking', () => {
    const afterDays = hour({
      precipitationMm: 2,
      precipitation24hMm: 45,
      wetnessMm: 45
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
      wetnessMm: 1.2,
      weatherCode: 63
    });

    const { score, cappedBy } = scoreHour(perfectButWet, 'open');

    expect(score).toBeLessThanOrEqual(20);
    expect(cappedBy).toBe('heavy_rain');
  });

  it('holds a drizzle and wet rock under the window floor by weight alone', () => {
    const drizzle = scoreHour(
      hour({ precipitationMm: 0.1, wetnessMm: 0.1, weatherCode: 51 }),
      'open'
    );
    const soaked = scoreHour(hour({ wetnessMm: 3 }), 'open');
    const drying = scoreHour(hour({ wetnessMm: 1.5 }), 'open');
    const nearlyDry = scoreHour(hour({ wetnessMm: 0.3 }), 'open');

    expect(drizzle.cappedBy).toBeNull();
    expect(drizzle.score).toBeLessThan(45);
    expect(soaked.score).toBe(40);
    expect(drying.score).toBeGreaterThan(soaked.score);
    expect(drying.score).toBeLessThan(nearlyDry.score);
    expect(nearlyDry.score).toBe(87);
  });

  it('does not hold a cave down for rain that never reaches it', () => {
    const inTheCave = scoreHour(
      hour({
        temperatureC: 14,
        precipitationMm: 1.2,
        wetnessMm: 1.2,
        weatherCode: 63
      }),
      'full'
    );

    expect(inTheCave.cappedBy).toBeNull();
    expect(inTheCave.score).toBeGreaterThan(20);
  });
});

describe('an hour', () => {
  it('needs every factor for a hundred', () => {
    expect(scoreHour(hour({ temperatureC: 12 }), 'open').score).toBe(100);
    expect(scoreHour(hour({ temperatureC: 19 }), 'open').score).toBe(98);
  });

  it('is dragged down by one damp factor alone', () => {
    expect(scoreHour(hour({ humidityPct: 89 }), 'open').score).toBe(81);
  });

  it('is poor through a cold damp drizzle', () => {
    const drizzle = scoreHour(
      hour({
        temperatureC: 7,
        humidityPct: 81,
        windSpeedMs: 2,
        precipitationMm: 0.1,
        wetnessMm: 0.1,
        weatherCode: 51
      }),
      'open'
    );

    expect(drizzle.score).toBeLessThan(45);
    expect(drizzle.band).toBe('poor');
  });
});

describe('day', () => {
  const empty = Array.from({ length: 24 }, () => null) as (number | null)[];

  it('is its best session, not its average', () => {
    const day = [...empty];

    [40, 40, 60, 96, 97, 97, 97, 93, 93].forEach((score, offset) => {
      day[8 + offset] = score;
    });

    expect(dayScore(day)).toBe(96);
  });

  it('stays honest when only two hours dry out', () => {
    const day = [...empty];

    [40, 40, 40, 40, 40, 60, 92, 92].forEach((score, offset) => {
      day[8 + offset] = score;
    });

    expect(dayScore(day)).toBe(61);
  });

  it('is nothing without a forecast', () => {
    expect(dayScore(empty)).toBeNull();
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
