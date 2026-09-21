import { useMemo } from 'react';

import type { Topo } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import type { Route } from '../entities';

export interface RouteGroup {
  id: string;
  label: string;
  routes: Route[];
}

export interface Params {
  routes: Route[];
  topos: Topo[];
  /** The number each route wears on the photo; the list follows it. */
  numberOf: Record<string, number>;
}

export const useRoutesByTopo = ({
  routes,
  topos,
  numberOf
}: Params): RouteGroup[] => {
  const { t } = useLingui();

  return useMemo(() => {
    const byNumber = (group: Route[]) =>
      [...group].sort(
        (left, right) =>
          (numberOf[left.id] ?? Number.MAX_SAFE_INTEGER) -
          (numberOf[right.id] ?? Number.MAX_SAFE_INTEGER)
      );

    const byId = new Map(routes.map((route) => [route.id, route]));
    const grouped: RouteGroup[] = [];
    const placed = new Set<string>();

    for (const topo of topos) {
      const topoRoutes = topo.lines
        .map((line) => byId.get(line.idRoute))
        .filter((route): route is Route => !!route);

      for (const route of topoRoutes) placed.add(route.id);

      if (topoRoutes.length > 0) {
        grouped.push({
          id: topo.id,
          label: topo.label,
          routes: byNumber(topoRoutes)
        });
      }
    }

    const rest = routes.filter((route) => !placed.has(route.id));

    if (rest.length > 0) {
      grouped.push({
        id: 'rest',
        label: t`Not on a photo`,
        routes: byNumber(rest)
      });
    }

    return grouped;
  }, [routes, topos, numberOf, t]);
};
