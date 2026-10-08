import type { ConditionsDay } from '../entities';

export const dayRainMm = (day: ConditionsDay): number | null => {
  const known = day.hours
    .map((hour) => hour.precipitationMm)
    .filter((mm): mm is number => mm != null);

  if (known.length === 0) return null;

  return Number(known.reduce((total, mm) => total + mm, 0).toFixed(1));
};
