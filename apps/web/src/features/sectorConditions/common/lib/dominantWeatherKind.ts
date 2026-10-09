import type { ConditionsHour } from '../entities';
import type { WeatherKind } from './weatherKind';
import { weatherKindOf } from './weatherKind';

// The one picture for the day is the sky most of its hours had: a cloud over
// a day that mostly rained would be a lie.
export const dominantWeatherKind = (
  hours: ConditionsHour[]
): WeatherKind | null => {
  const counts = new Map<WeatherKind, number>();
  let best: WeatherKind | null = null;
  let most = 0;

  for (const hour of hours) {
    const kind = weatherKindOf(hour.weatherCode, hour.precipitationMm);

    if (!kind) continue;

    const count = (counts.get(kind) ?? 0) + 1;

    counts.set(kind, count);

    if (count > most) {
      best = kind;
      most = count;
    }
  }

  return best;
};
