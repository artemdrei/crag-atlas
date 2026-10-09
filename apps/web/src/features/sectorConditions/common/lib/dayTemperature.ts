import type { ConditionsDay } from '../entities';

export interface DayTemperature {
  minC: number;
  maxC: number;
}

export const dayTemperature = (day: ConditionsDay): DayTemperature | null => {
  const known = day.hours
    .map((hour) => hour.temperatureC)
    .filter((value): value is number => value != null);

  if (known.length === 0) return null;

  return {
    minC: Math.round(Math.min(...known)),
    maxC: Math.round(Math.max(...known))
  };
};
