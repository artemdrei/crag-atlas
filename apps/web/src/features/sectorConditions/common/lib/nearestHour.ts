import type { ConditionsHour } from '../entities';

const minutesOf = (at: string): number => {
  const [hours = 0, minutes = 0] = at.split(':').map(Number);

  return hours * 60 + minutes;
};

export const nearestHour = (
  hours: ConditionsHour[],
  now: Date
): ConditionsHour | null => {
  const target = now.getHours() * 60 + now.getMinutes();

  return hours.reduce<ConditionsHour | null>((best, hour) => {
    if (hour.temperatureC == null) return best;
    if (!best) return hour;

    return Math.abs(minutesOf(hour.at) - target) <
      Math.abs(minutesOf(best.at) - target)
      ? hour
      : best;
  }, null);
};
