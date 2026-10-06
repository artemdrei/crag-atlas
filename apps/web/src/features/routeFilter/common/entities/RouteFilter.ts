import type { GradeScale } from '@crag-atlas/api';

export const ROUTE_SORTS = [
  'default',
  'rating',
  'length',
  'grade',
  'ascents'
] as const;

export type RouteSort = (typeof ROUTE_SORTS)[number];

export const ROUTE_SORT_DIRECTIONS = ['desc', 'asc'] as const;

export type RouteSortDirection = (typeof ROUTE_SORT_DIRECTIONS)[number];

export const RATING_FILTERS = ['any', '4', '4.5'] as const;

export type RatingFilter = (typeof RATING_FILTERS)[number];

export const LENGTH_FILTERS = ['any', 'short', 'long'] as const;

export type LengthFilter = (typeof LENGTH_FILTERS)[number];

export const TICKED_FILTERS = ['any', 'notDone', 'done'] as const;

export type TickedFilter = (typeof TICKED_FILTERS)[number];

export const LONG_ROUTE_METERS = 15;

export const ROUTE_FILTER_PARAMS = {
  grades: 'grades',
  rating: 'rating',
  length: 'length',
  ticked: 'ascents',
  sort: 'sort',
  direction: 'order'
} as const;

export interface RouteFilter {
  grades: string[];
  rating: RatingFilter;
  length: LengthFilter;
  ticked: TickedFilter;
}

export const EMPTY_ROUTE_FILTER: RouteFilter = {
  grades: [],
  rating: 'any',
  length: 'any',
  ticked: 'any'
};

export interface FilterableRoute {
  id: string;
  grade: string;
  gradeScale: GradeScale;
  type: 'sport' | 'boulder';
  rating?: number | null;
  length?: number | null;
  ascentsCount?: number | null;
}
