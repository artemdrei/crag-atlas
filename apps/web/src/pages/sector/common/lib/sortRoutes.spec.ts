import { describe, expect, it } from 'vitest';

import type { Route } from '../entities';
import { sortRoutes } from './sortRoutes';

const order = { 'french|6a': 0, 'french|6c': 1, 'french|7a': 2 };

const route = (name: string, fields: Partial<Route> = {}): Route =>
  ({
    id: name,
    name,
    grade: '6a',
    gradeScale: 'french',
    ...fields
  }) as Route;

describe('sortRoutes', () => {
  it('leaves the order alone when nothing is picked', () => {
    const routes = [route('b'), route('a')];

    expect(sortRoutes(routes, 'default', 'desc', order)).toBe(routes);
  });

  it('puts the hardest grade first', () => {
    const routes = [
      route('easy'),
      route('hard', { grade: '7a' }),
      route('mid', { grade: '6c' })
    ];

    expect(
      sortRoutes(routes, 'grade', 'desc', order).map(({ name }) => name)
    ).toEqual(['hard', 'mid', 'easy']);
  });

  it('sinks a grade the histogram does not list', () => {
    const routes = [
      route('unlisted', { grade: '9a' }),
      route('listed', { grade: '6a' })
    ];

    expect(
      sortRoutes(routes, 'grade', 'desc', order).map(({ name }) => name)
    ).toEqual(['listed', 'unlisted']);
  });

  it('puts the best rated first and counts a missing rating as zero', () => {
    const routes = [
      route('unrated', { rating: null }),
      route('good', { rating: 4.5 }),
      route('fine', { rating: 3.1 })
    ];

    expect(
      sortRoutes(routes, 'rating', 'desc', order).map(({ name }) => name)
    ).toEqual(['good', 'fine', 'unrated']);
  });

  it('puts the longest first and counts a missing length as zero', () => {
    const routes = [
      route('unknown', { length: null }),
      route('short', { length: 12 }),
      route('long', { length: 35 })
    ];

    expect(
      sortRoutes(routes, 'length', 'desc', order).map(({ name }) => name)
    ).toEqual(['long', 'short', 'unknown']);
  });

  it('puts the most climbed first', () => {
    const routes = [
      route('quiet', { ascentsCount: 3 }),
      route('busy', { ascentsCount: 58 })
    ];

    expect(
      sortRoutes(routes, 'ascents', 'desc', order).map(({ name }) => name)
    ).toEqual(['busy', 'quiet']);
  });

  it('flips the order when the direction is ascending', () => {
    const routes = [
      route('hard', { grade: '7a' }),
      route('easy', { grade: '6a' })
    ];

    expect(
      sortRoutes(routes, 'grade', 'asc', order).map(({ name }) => name)
    ).toEqual(['easy', 'hard']);
  });

  it('keeps the incoming order between ties', () => {
    const routes = [route('b', { rating: 4 }), route('a', { rating: 4 })];

    expect(
      sortRoutes(routes, 'rating', 'desc', order).map(({ name }) => name)
    ).toEqual(['b', 'a']);
  });
});
