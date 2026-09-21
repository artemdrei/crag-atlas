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
}

export const useRoutesByTopo = ({ routes, topos }: Params): RouteGroup[] => {
  const { t } = useLingui();

  return useMemo(() => {
    const byId = new Map(routes.map((route) => [route.id, route]));
    const grouped: RouteGroup[] = [];
    const placed = new Set<string>();

    for (const topo of topos) {
      const topoRoutes = topo.lines
        .map((line) => byId.get(line.idRoute))
        .filter((route): route is Route => !!route);

      for (const route of topoRoutes) placed.add(route.id);

      if (topoRoutes.length > 0) {
        grouped.push({ id: topo.id, label: topo.label, routes: topoRoutes });
      }
    }

    const rest = routes.filter((route) => !placed.has(route.id));

    if (rest.length > 0) {
      grouped.push({ id: 'rest', label: t`Not on a photo`, routes: rest });
    }

    return grouped;
  }, [routes, topos, t]);
};
