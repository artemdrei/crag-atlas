import { gradeKey } from '@web/shared/lib';

import {
  type FilterableRoute,
  LONG_ROUTE_METERS,
  type RouteFilter
} from '../entities';

export const matchesRouteFilter = (
  route: FilterableRoute,
  filter: RouteFilter,
  tickedRoutes: ReadonlySet<string>
): boolean => {
  if (
    filter.grades.length > 0 &&
    !filter.grades.includes(gradeKey(route.grade, route.gradeScale))
  )
    return false;

  if (filter.rating !== 'any' && (route.rating ?? 0) < Number(filter.rating))
    return false;

  // An unmeasured route answers neither length, so it never hides behind one.
  if (filter.length !== 'any') {
    if (route.length == null) return false;

    const isLong = route.length >= LONG_ROUTE_METERS;

    if (isLong !== (filter.length === 'long')) return false;
  }

  if (filter.ticked !== 'any') {
    const isDone = tickedRoutes.has(route.id);

    if (isDone !== (filter.ticked === 'done')) return false;
  }

  return true;
};

export const countActiveFilters = (filter: RouteFilter): number =>
  [
    filter.grades.length > 0,
    filter.rating !== 'any',
    filter.length !== 'any',
    filter.ticked !== 'any'
  ].filter(Boolean).length;
