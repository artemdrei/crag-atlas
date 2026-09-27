import { useMemo } from 'react';

import type { TickStats } from '@crag-atlas/api';

import { useDisplayGrade } from '@web/shared/lib';

import type {
  AscentFilter,
  Discipline,
  GradeBar,
  GradeGroup,
  Tick
} from '../entities';
import { ascentCounts, gradeBars, groupTicksByGrade } from '../lib';

export const TOP_GRADES_LIMIT = 8;

export interface Params {
  ticks: Tick[];
  stats: TickStats | null;
  discipline: Discipline;
  ascentType: AscentFilter;
}

export interface LogbookView {
  bars: GradeBar[];
  counts: Record<AscentFilter, number>;
  groups: GradeGroup[];
  ungraded: Tick[];
}

export const useLogbookView = ({
  ticks,
  stats,
  discipline,
  ascentType
}: Params): LogbookView => {
  const displayGrade = useDisplayGrade();

  return useMemo(() => {
    const bars = gradeBars(stats?.grades ?? [], discipline, displayGrade);
    const { groups, ungraded } = groupTicksByGrade(ticks, displayGrade);
    const totals = new Map(bars.map((bar) => [bar.grade, bar]));

    return {
      bars: bars.slice(0, TOP_GRADES_LIMIT),
      counts: ascentCounts(stats?.grades ?? [], discipline),
      // A section header counts every ascent of that grade, not the ones this
      // page happened to bring.
      groups: groups.map((group) => {
        const bar = totals.get(group.grade);

        if (!bar) {
          return group;
        }

        return {
          ...group,
          total:
            ascentType === 'all' ? bar.total : (bar.counts[ascentType] ?? 0)
        };
      }),
      ungraded
    };
  }, [ticks, stats, discipline, ascentType, displayGrade]);
};
