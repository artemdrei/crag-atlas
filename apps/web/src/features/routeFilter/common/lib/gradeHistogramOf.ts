import type { GradeHistogramGroup } from '@crag-atlas/api';

import { gradeKey } from '@web/shared/lib';

import type { FilterableRoute } from '../entities';

const TYPES: FilterableRoute['type'][] = ['sport', 'boulder'];

export const gradeHistogramOf = (
  routes: FilterableRoute[],
  gradeOrder: Record<string, number>
): GradeHistogramGroup[] =>
  TYPES.flatMap((type) => {
    const ofType = routes.filter((route) => route.type === type);

    if (ofType.length === 0) return [];

    const counts = new Map<string, GradeHistogramGroup['grades'][number]>();

    for (const { grade, gradeScale } of ofType) {
      const key = gradeKey(grade, gradeScale);
      const known = counts.get(key);

      counts.set(key, {
        grade,
        scale: gradeScale,
        count: (known?.count ?? 0) + 1
      });
    }

    const grades = [...counts.entries()]
      .sort(
        ([one], [other]) => (gradeOrder[one] ?? 0) - (gradeOrder[other] ?? 0)
      )
      .map(([, count]) => count);

    return [{ type, routeCount: ofType.length, grades }];
  });
