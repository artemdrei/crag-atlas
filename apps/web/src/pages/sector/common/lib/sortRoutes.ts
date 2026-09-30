import { gradeKey } from '@web/shared/lib';

import type { Route, RouteSort, RouteSortDirection } from '../entities';

// Below every known grade, so a route the histogram has not listed yet sinks
// to the bottom instead of leading a descending sort.
const UNRANKED = -1;

const rankOf = (
  route: Route,
  sort: RouteSort,
  order: Record<string, number>
): number => {
  switch (sort) {
    case 'grade':
      return order[gradeKey(route.grade, route.gradeScale)] ?? UNRANKED;
    case 'rating':
      return route.rating ?? 0;
    case 'ascents':
      return route.ascentsCount ?? 0;
    default:
      return 0;
  }
};

// Descending puts the hardest, best and most climbed first, matching how the
// logbook orders grades.
export const sortRoutes = (
  routes: Route[],
  sort: RouteSort,
  direction: RouteSortDirection,
  order: Record<string, number>
): Route[] => {
  if (sort === 'default') return routes;

  const sign = direction === 'asc' ? -1 : 1;

  return [...routes].sort(
    (one, other) =>
      sign * (rankOf(other, sort, order) - rankOf(one, sort, order))
  );
};
