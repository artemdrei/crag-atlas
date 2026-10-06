import { useMemo } from 'react';

import type { GradeHistogramGroup } from '@crag-atlas/api';

import { gradeOrder, useRouteFilter } from '@web/features/routeFilter';

import type { SectorListItem } from '../entities';
import { matchSectors } from '../lib';

export interface Params {
  sectors: SectorListItem[];
  gradeHistogram: GradeHistogramGroup[] | undefined;
  tickedRoutes: ReadonlySet<string>;
  isEnabled: boolean;
}

export const useRegionRouteFilter = ({
  sectors,
  gradeHistogram,
  tickedRoutes,
  isEnabled
}: Params) => {
  const state = useRouteFilter('region');
  const { filter, sort, direction, activeCount } = state;
  const orderOfGrade = useMemo(
    () => gradeOrder(gradeHistogram ?? []),
    [gradeHistogram]
  );

  const matches = useMemo(
    () =>
      isEnabled
        ? matchSectors({
            sectors,
            filter,
            sort,
            direction,
            tickedRoutes,
            gradeOrder: orderOfGrade,
            isFiltered: activeCount > 0
          })
        : {
            orderedSectors: sectors,
            matchOf: undefined,
            matchedCount: 0,
            matchedSectorCount: 0
          },
    [
      isEnabled,
      sectors,
      filter,
      sort,
      direction,
      tickedRoutes,
      orderOfGrade,
      activeCount
    ]
  );

  return { state, gradeOrder: orderOfGrade, ...matches };
};
