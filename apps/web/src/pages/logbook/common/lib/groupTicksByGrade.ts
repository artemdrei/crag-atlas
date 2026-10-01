import type { GradeScale } from '@crag-atlas/api';
import { getScoreForSort } from '@openbeta/sandbag';

import type { GradeGroup, GradeGrouping, Tick } from '../entities';

type DisplayGrade = (grade: string, scale: GradeScale) => string;

// A converted label is not always a member of that scale (`5.11c/d`), so the
// order comes from the stored grade. An unreadable grade scores -1.
export const groupTicksByGrade = (
  ticks: Tick[],
  displayGrade: DisplayGrade
): GradeGrouping => {
  const byGrade = new Map<string, GradeGroup>();
  const ungraded: Tick[] = [];

  for (const tick of ticks) {
    if (!tick.routeGrade || !tick.routeGradeScale) {
      ungraded.push(tick);
      continue;
    }

    const grade = displayGrade(tick.routeGrade, tick.routeGradeScale);
    const group = byGrade.get(grade) ?? {
      grade,
      sourceGrade: tick.routeGrade,
      scale: tick.routeGradeScale,
      score: getScoreForSort(tick.routeGrade, tick.routeGradeScale),
      total: 0,
      ticks: [],
      counts: {}
    };

    group.ticks.push(tick);
    group.total += 1;
    group.counts[tick.ascentType] = (group.counts[tick.ascentType] ?? 0) + 1;
    byGrade.set(grade, group);
  }

  const groups = [...byGrade.values()].sort((a, b) => b.score - a.score);

  return { groups, ungraded };
};
