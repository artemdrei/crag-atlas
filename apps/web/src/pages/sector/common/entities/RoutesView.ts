export const ROUTE_SORTS = [
  'default',
  'rating',
  'length',
  'grade',
  'ascents'
] as const;

export type RouteSort = (typeof ROUTE_SORTS)[number];

export type RouteSortDirection = 'asc' | 'desc';
