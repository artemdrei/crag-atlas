import type { GradeHistogramGroup } from '@crag-atlas/api';

import {
  gradeHistogramOf,
  matchesRouteFilter,
  type RouteFilter,
  type RouteSort,
  type RouteSortDirection,
  rankRoute
} from '@web/features/routeFilter';

import type { SectorListItem } from '../entities';

export interface SectorMatchSummary {
  matchedCount: number;
  gradeHistogram: GradeHistogramGroup[];
}

export interface Params {
  sectors: SectorListItem[];
  filter: RouteFilter;
  sort: RouteSort;
  direction: RouteSortDirection;
  tickedRoutes: ReadonlySet<string>;
  gradeOrder: Record<string, number>;
  isFiltered: boolean;
}

export const matchSectors = ({
  sectors,
  filter,
  sort,
  direction,
  tickedRoutes,
  gradeOrder,
  isFiltered
}: Params) => {
  const sign = direction === 'asc' ? -1 : 1;

  const groups = sectors.map((sector) => {
    const matched = sector.routes.filter((route) =>
      matchesRouteFilter(route, filter, tickedRoutes)
    );
    const bestRank = matched.reduce(
      (best, route) =>
        Math.max(best, sign * rankRoute(route, sort, gradeOrder)),
      -Infinity
    );

    return { sector, matched, bestRank };
  });

  const matching = groups.filter(({ matched }) => matched.length > 0);
  const empty = groups.filter(({ matched }) => matched.length === 0);

  if (sort !== 'default')
    matching.sort((one, other) => other.bestRank - one.bestRank);

  return {
    orderedSectors:
      isFiltered || sort !== 'default'
        ? [...matching, ...empty].map(({ sector }) => sector)
        : sectors,
    matchOf: isFiltered
      ? Object.fromEntries(
          groups.map(({ sector, matched }): [string, SectorMatchSummary] => [
            sector.id,
            {
              matchedCount: matched.length,
              gradeHistogram: gradeHistogramOf(matched, gradeOrder)
            }
          ])
        )
      : undefined,
    matchedCount: matching.reduce(
      (sum, { matched }) => sum + matched.length,
      0
    ),
    matchedSectorCount: matching.length
  };
};
