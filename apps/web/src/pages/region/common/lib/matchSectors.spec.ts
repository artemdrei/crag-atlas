import type { SectorRoute } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { EMPTY_ROUTE_FILTER } from '@web/features/routeFilter';

import type { SectorListItem } from '../entities';
import { matchSectors, type Params } from './matchSectors';

const route = (id: string, rating: number): SectorRoute => ({
  id,
  name: id,
  grade: '6a',
  gradeScale: 'french',
  type: 'sport',
  rating
});

const sector = (id: string, routes: SectorRoute[]) =>
  ({ id, routes }) as SectorListItem;

const sectors = [
  sector('Cisne', [route('c1', 3)]),
  sector('Dalnij', [route('d1', 4.1), route('d2', 4.8)]),
  sector('Grizli', [route('g1', 4.5)])
];

const match = (overrides: Partial<Params>) =>
  matchSectors({
    sectors,
    filter: EMPTY_ROUTE_FILTER,
    sort: 'default',
    direction: 'desc',
    tickedRoutes: new Set(),
    gradeOrder: {},
    isFiltered: false,
    ...overrides
  });

const ids = (list: { id: string }[]) => list.map(({ id }) => id);

describe('matchSectors', () => {
  it('narrows each sector to its routes that match', () => {
    const result = match({
      filter: { ...EMPTY_ROUTE_FILTER, rating: '4' },
      isFiltered: true
    });

    expect(ids(result.orderedSectors)).toEqual(['Dalnij', 'Grizli']);
    expect(result.matchOf?.Dalnij?.matchedCount).toBe(2);
    expect(result.matchOf?.Grizli?.matchedCount).toBe(1);
    expect(result.matchOf?.Cisne?.matchedCount).toBe(0);
    expect(result.matchedCount).toBe(3);
    expect(result.matchedSectorCount).toBe(2);
  });

  it('orders the sectors by their best route', () => {
    const result = match({ sort: 'rating' });

    expect(ids(result.orderedSectors)).toEqual(['Dalnij', 'Grizli', 'Cisne']);
  });

  it('ranks a sector by the route it lists first when ascending', () => {
    const result = match({ sort: 'rating', direction: 'asc' });

    expect(ids(result.orderedSectors)).toEqual(['Cisne', 'Dalnij', 'Grizli']);
  });
});
