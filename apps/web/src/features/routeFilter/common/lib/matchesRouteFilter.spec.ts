import { describe, expect, it } from 'vitest';

import {
  EMPTY_ROUTE_FILTER,
  type FilterableRoute,
  type RouteFilter
} from '../entities';
import { countActiveFilters, matchesRouteFilter } from './matchesRouteFilter';

const route = (fields: Partial<FilterableRoute> = {}): FilterableRoute => ({
  id: 'r1',
  grade: '6a',
  gradeScale: 'french',
  type: 'sport',
  rating: 4.2,
  length: 10,
  ...fields
});

const filter = (fields: Partial<RouteFilter>): RouteFilter => ({
  ...EMPTY_ROUTE_FILTER,
  ...fields
});

const none = new Set<string>();

describe('matchesRouteFilter', () => {
  it('lets every route through an empty filter', () => {
    expect(matchesRouteFilter(route(), EMPTY_ROUTE_FILTER, none)).toBe(true);
  });

  it('keeps only the grades picked', () => {
    const picked = filter({ grades: ['french|7a'] });

    expect(matchesRouteFilter(route(), picked, none)).toBe(false);
    expect(matchesRouteFilter(route({ grade: '7a' }), picked, none)).toBe(true);
  });

  it('holds a route to the rating floor', () => {
    const floor = filter({ rating: '4.5' });

    expect(matchesRouteFilter(route(), floor, none)).toBe(false);
    expect(matchesRouteFilter(route({ rating: 4.5 }), floor, none)).toBe(true);
    expect(matchesRouteFilter(route({ rating: null }), floor, none)).toBe(
      false
    );
  });

  it('splits short and long at 15 m', () => {
    expect(matchesRouteFilter(route(), filter({ length: 'short' }), none)).toBe(
      true
    );
    expect(
      matchesRouteFilter(
        route({ length: 15 }),
        filter({ length: 'long' }),
        none
      )
    ).toBe(true);
  });

  it('leaves an unmeasured route out of either length', () => {
    const unmeasured = route({ length: null });

    expect(
      matchesRouteFilter(unmeasured, filter({ length: 'short' }), none)
    ).toBe(false);
    expect(
      matchesRouteFilter(unmeasured, filter({ length: 'long' }), none)
    ).toBe(false);
  });

  it('tells done from not done by the climber’s ascents', () => {
    const ticked = new Set(['r1']);

    expect(
      matchesRouteFilter(route(), filter({ ticked: 'done' }), ticked)
    ).toBe(true);
    expect(
      matchesRouteFilter(route(), filter({ ticked: 'notDone' }), ticked)
    ).toBe(false);
  });
});

describe('countActiveFilters', () => {
  it('counts each kind of filter once, however many grades are picked', () => {
    expect(
      countActiveFilters(
        filter({
          grades: ['french|6a', 'french|7a'],
          rating: '4',
          ticked: 'done'
        })
      )
    ).toBe(3);
  });
});
