import type { ConditionsDay, ConditionsHour } from '../entities';

const MIDDAY = '14:00';

// The numbers beside the score describe the hours the climber would be
// there, so they are read from the middle of the best window rather than
// averaged over a day that includes dawn.
export const representativeHour = (
  day: ConditionsDay | null
): ConditionsHour | null => {
  const hours = day?.hours ?? [];

  if (hours.length === 0) return null;

  const from = hours.findIndex((hour) => hour.at === day?.bestFromAt);
  const until = hours.findIndex((hour) => hour.at === day?.bestUntilAt);

  if (from >= 0 && until > from) {
    return hours[Math.floor((from + until) / 2)] ?? null;
  }

  return hours.find((hour) => hour.at === MIDDAY) ?? hours[0] ?? null;
};
