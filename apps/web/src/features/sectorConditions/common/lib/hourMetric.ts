import type { ConditionsHour } from '../entities';
import { toKmh } from './units';

export type Metric = 'score' | 'weather' | 'precipitation' | 'wind';

export const hourValueOf = (
  hour: ConditionsHour,
  metric: Metric
): number | null => {
  switch (metric) {
    case 'score':
      return hour.score;
    case 'precipitation':
      return hour.precipitationMm == null
        ? null
        : Number(hour.precipitationMm.toFixed(1));
    case 'wind':
      return hour.windSpeedMs == null ? null : toKmh(hour.windSpeedMs);
    default:
      return hour.temperatureC == null ? null : Math.round(hour.temperatureC);
  }
};
