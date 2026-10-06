import type { Topo } from '@crag-atlas/api';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  EMPTY_ROUTE_FILTER,
  type RouteFilter
} from '@web/features/routeFilter';

import type { Route } from '../entities';
import { useVisibleRoutes } from './useVisibleRoutes';

vi.mock('@web/app/providers', () => ({
  useUser: () => ({ isAuthenticated: true })
}));

const route = (id: string, grade: string): Route =>
  ({ id, grade, gradeScale: 'french', type: 'sport' }) as Route;

const topo = (id: string, idRoutes: string[]): Topo =>
  ({ id, lines: idRoutes.map((idRoute) => ({ idRoute })) }) as Topo;

const routes = [route('a', '6a'), route('b', '6a'), route('c', '7a')];
const topos = [topo('one', ['a', 'c']), topo('two', ['b'])];

const render = (filter: Partial<RouteFilter>, ticked: string[] = []) =>
  renderHook(() =>
    useVisibleRoutes({
      routes,
      topos,
      filter: { ...EMPTY_ROUTE_FILTER, ...filter },
      tickedRoutes: new Set(ticked)
    })
  ).result.current;

describe('useVisibleRoutes', () => {
  it('shows the whole sector until a filter is set', () => {
    const { visibleRoutes, visibleTopos } = render({});

    expect(visibleRoutes).toHaveLength(3);
    expect(visibleTopos).toBe(topos);
  });

  it('keeps only the lines of the routes still shown', () => {
    const { visibleRoutes, visibleTopos } = render({ grades: ['french|7a'] });

    expect(visibleRoutes.map(({ id }) => id)).toEqual(['c']);
    expect(visibleTopos.map(({ id }) => id)).toEqual(['one']);
    expect(visibleTopos[0]?.lines.map(({ idRoute }) => idRoute)).toEqual(['c']);
  });

  it('counts the climbed routes among those shown', () => {
    expect(render({ grades: ['french|6a'] }, ['a', 'c']).tickedCount).toBe(1);
  });
});
