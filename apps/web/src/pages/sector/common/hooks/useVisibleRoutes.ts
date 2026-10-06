import { useMemo } from 'react';

import type { Topo } from '@crag-atlas/api';

import { useUser } from '@web/app/providers';
import {
  matchesRouteFilter,
  type RouteFilter
} from '@web/features/routeFilter';

import type { Route } from '../entities';

export interface Params {
  routes: Route[];
  topos: Topo[];
  filter: RouteFilter;
  tickedRoutes: ReadonlySet<string>;
}

export const useVisibleRoutes = ({
  routes,
  topos,
  filter,
  tickedRoutes
}: Params) => {
  const { isAuthenticated } = useUser();

  const visibleRoutes = useMemo(
    () =>
      routes.filter((route) => matchesRouteFilter(route, filter, tickedRoutes)),
    [routes, filter, tickedRoutes]
  );

  const visibleTopos = useMemo(() => {
    if (visibleRoutes.length === routes.length) return topos;

    const visible = new Set(visibleRoutes.map(({ id }) => id));

    return topos
      .map((topo) => ({
        ...topo,
        lines: topo.lines.filter((line) => visible.has(line.idRoute))
      }))
      .filter(({ lines }) => lines.length > 0);
  }, [topos, routes, visibleRoutes]);

  const tickedCount = isAuthenticated
    ? visibleRoutes.filter(({ id }) => tickedRoutes.has(id)).length
    : undefined;

  return { visibleRoutes, visibleTopos, tickedCount };
};
