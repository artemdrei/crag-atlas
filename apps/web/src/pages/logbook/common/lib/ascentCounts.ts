import type { Tick, TickGradeCount } from '@crag-atlas/api';

import type { AscentFilter, Discipline } from '../entities';
import { scaleDiscipline } from './tickDiscipline';

export const ascentCounts = (
  grades: TickGradeCount[],
  discipline: Discipline
): Record<AscentFilter, number> => {
  const counts = { all: 0 } as Record<AscentFilter, number>;

  for (const row of grades) {
    if (scaleDiscipline(row.scale) !== discipline) {
      continue;
    }

    const ascentType = row.ascentType as Tick['ascentType'];

    counts.all += row.count;
    counts[ascentType] = (counts[ascentType] ?? 0) + row.count;
  }

  return counts;
};
