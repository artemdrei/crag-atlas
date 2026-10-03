import type { ConditionsDay, SectorConditions } from '../entities';

export interface SunShade {
  firstSunAt: string | null;
  lastSunAt: string | null;
  isAllDay: boolean;
  isNever: boolean;
}

export const sunShadeOf = (day: ConditionsDay | null): SunShade => {
  const intervals = day?.sunIntervals ?? [];
  const first = intervals[0];
  const last = intervals[intervals.length - 1];

  return {
    firstSunAt: first?.fromAt ?? null,
    lastSunAt: last?.untilAt ?? null,
    isAllDay:
      intervals.length === 1 &&
      first?.fromAt === day?.sunriseAt &&
      last?.untilAt === day?.sunsetAt,
    isNever: intervals.length === 0
  };
};

// Without a skyline or a wall to face, every hour between sunrise and sunset
// comes back lit — that is the length of the day, not a fact about the crag.
export const isSunKnown = (conditions: SectorConditions): boolean =>
  conditions.isHorizonReady || conditions.aspectDeg !== null;
