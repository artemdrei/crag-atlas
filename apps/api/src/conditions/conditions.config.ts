import type { Shelter } from '../common/utils/shelter';

export const CONDITION_BANDS = [
  'excellent',
  'good',
  'ok',
  'poor',
  'bad'
] as const;

export type ConditionBand = (typeof CONDITION_BANDS)[number];

// A table is read top to bottom and the first row whose `upTo` the value is
// still under wins, so the bounds read the way the thresholds were written
// down: under zero, nought to five, five to ten.
export interface Step {
  upTo: number;
  score: number;
}

export interface SunShadeStep {
  upTo: number;
  sun: number;
  shade: number;
}

export interface HardCap {
  code: string;
  maxScore: number;
  // Every field present must hold for the cap to bite.
  precipitationMmAbove?: number;
  temperatureCBelow?: number;
  windKmhAbove?: number;
  weatherCodes?: number[];
}

export interface ShelterRule {
  // Rain can take the factor no lower than this, whatever is falling.
  rainFloor: number;
  // Water finds its way through a roof after a long soaking, so a cave is dry
  // rather than permanently dry. Read against the last twenty-four hours.
  seepage: Step[];
  // An open crag in the rain is simply off; under a roof the cap would say
  // the opposite of what the climber can see.
  obeysRainCap: boolean;
  // Sun on the face does not reach a climber under a deep roof, so the term
  // is scored as shade however the skyline falls.
  isAlwaysShadeScored: boolean;
}

export const CONDITIONS_CONFIG = {
  weights: {
    rain: 0.3,
    temperature: 0.25,
    humidity: 0.15,
    sunShade: 0.15,
    wind: 0.1,
    other: 0.05
  },

  // What is falling this hour.
  rainNow: [
    { upTo: 0.1, score: 100 },
    { upTo: 0.5, score: 20 },
    { upTo: Number.POSITIVE_INFINITY, score: 0 }
  ] satisfies Step[],

  // Hours since the last hour that saw rain. A dry hour on a wall that took
  // eight millimetres overnight is still a wet wall.
  rainRecency: [
    { upTo: 3, score: 10 },
    { upTo: 12, score: 40 },
    { upTo: 24, score: 70 },
    { upTo: Number.POSITIVE_INFINITY, score: 100 }
  ] satisfies Step[],

  temperature: [
    { upTo: 0, score: 20 },
    { upTo: 5, score: 50 },
    { upTo: 10, score: 80 },
    { upTo: 18, score: 100 },
    { upTo: 23, score: 90 },
    { upTo: 28, score: 65 },
    { upTo: Number.POSITIVE_INFINITY, score: 35 }
  ] satisfies Step[],

  humidity: [
    { upTo: 40, score: 90 },
    { upTo: 65, score: 100 },
    { upTo: 80, score: 75 },
    { upTo: 90, score: 45 },
    { upTo: Number.POSITIVE_INFINITY, score: 20 }
  ] satisfies Step[],

  // Read in km/h, stored in m/s everywhere else.
  wind: [
    { upTo: 5, score: 90 },
    { upTo: 15, score: 100 },
    { upTo: 25, score: 80 },
    { upTo: 40, score: 50 },
    { upTo: Number.POSITIVE_INFINITY, score: 20 }
  ] satisfies Step[],

  // Sun is not good or bad on its own — it is the temperature that decides.
  sunShade: [
    { upTo: 5, sun: 100, shade: 50 },
    { upTo: 10, sun: 100, shade: 80 },
    { upTo: 18, sun: 95, shade: 100 },
    { upTo: 23, sun: 75, shade: 100 },
    { upTo: 28, sun: 40, shade: 95 },
    { upTo: Number.POSITIVE_INFINITY, sun: 15, shade: 85 }
  ] satisfies SunShadeStep[],

  // The five per cent left over, spent on what the other factors cannot see:
  // fog on the holds, snow, a thunderstorm overhead. Keyed by WMO code.
  weatherCode: {
    fallback: 100,
    ranges: [
      { from: 45, to: 48, score: 60 },
      { from: 51, to: 57, score: 50 },
      { from: 61, to: 67, score: 30 },
      { from: 71, to: 77, score: 25 },
      { from: 80, to: 82, score: 30 },
      { from: 85, to: 86, score: 20 },
      { from: 95, to: 99, score: 0 }
    ]
  },

  shelter: {
    open: {
      rainFloor: 0,
      seepage: [],
      obeysRainCap: true,
      isAlwaysShadeScored: false
    },
    partial: {
      rainFloor: 60,
      seepage: [
        { upTo: 20, score: 100 },
        { upTo: Number.POSITIVE_INFINITY, score: 70 }
      ],
      obeysRainCap: false,
      isAlwaysShadeScored: false
    },
    full: {
      rainFloor: 95,
      seepage: [
        { upTo: 20, score: 100 },
        { upTo: 40, score: 70 },
        { upTo: Number.POSITIVE_INFINITY, score: 50 }
      ],
      obeysRainCap: false,
      isAlwaysShadeScored: true
    }
  } satisfies Record<Shelter, ShelterRule>,

  // Applied after the weighted sum: no amount of perfect temperature makes a
  // downpour climbable.
  hardCaps: [
    { code: 'heavy_rain', maxScore: 20, precipitationMmAbove: 0.5 },
    { code: 'thunderstorm', maxScore: 15, weatherCodes: [95, 96, 99] },
    { code: 'storm_wind', maxScore: 25, windKmhAbove: 60 },
    { code: 'deep_freeze', maxScore: 40, temperatureCBelow: -5 }
  ] satisfies HardCap[],

  bands: [
    { from: 90, band: 'excellent' },
    { from: 75, band: 'good' },
    { from: 55, band: 'ok' },
    { from: 30, band: 'poor' },
    { from: 0, band: 'bad' }
  ] as { from: number; band: ConditionBand }[],

  // Nobody is at the crag at four in the morning, so the hours outside this
  // are neither shown nor averaged into the day.
  dayStartHour: 6,
  dayEndHour: 21,

  bestWindow: {
    minHours: 2,
    maxHours: 6,
    // Below this an hour cannot start or extend a window — a "best time" on a
    // day nobody should climb is a lie told politely.
    minHourScore: 45
  }
} as const;
