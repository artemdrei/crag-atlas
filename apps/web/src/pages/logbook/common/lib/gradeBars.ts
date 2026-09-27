import type { GradeScale, TickGradeCount } from '@crag-atlas/api';
import { getScoreForSort } from '@openbeta/sandbag';

import type { Discipline, GradeBar } from '../entities';
import { scaleDiscipline } from './tickDiscipline';

type DisplayGrade = (grade: string, scale: GradeScale) => string;

/**
 * The chart draws the whole logbook, so it is built from the counts the server
 * aggregated, never from the page the list happens to have loaded.
 */
export const gradeBars = (
  grades: TickGradeCount[],
  discipline: Discipline,
  displayGrade: DisplayGrade
): GradeBar[] => {
  const byGrade = new Map<string, GradeBar>();

  for (const row of grades) {
    if (scaleDiscipline(row.scale) !== discipline) {
      continue;
    }

    const grade = displayGrade(row.grade, row.scale);
    const bar = byGrade.get(grade) ?? {
      grade,
      sourceGrade: row.grade,
      scale: row.scale,
      score: getScoreForSort(row.grade, row.scale),
      total: 0,
      counts: {}
    };

    bar.total += row.count;
    bar.counts[row.ascentType] = (bar.counts[row.ascentType] ?? 0) + row.count;
    byGrade.set(grade, bar);
  }

  return [...byGrade.values()].sort((a, b) => b.score - a.score);
};
