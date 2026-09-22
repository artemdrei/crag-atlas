import { useMemo } from 'react';

import type { Topo } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { sortByNumber, usePhotoLabel } from '@web/features/topo';

import type { Route } from '../entities';

export interface RouteGroup {
  id: string;
  label: string;
  routes: Route[];
}

export interface Params {
  routes: Route[];
  topos: Topo[];
  numberOf: Record<string, number>;
}

export const useRoutesByTopo = ({
  routes,
  topos,
  numberOf
}: Params): RouteGroup[] => {
  const { t } = useLingui();
  const photoLabel = usePhotoLabel();

  return useMemo(() => {
    const byId = new Map(routes.map((route) => [route.id, route]));
    const grouped: RouteGroup[] = [];
    const placed = new Set<string>();

    for (const [index, topo] of topos.entries()) {
      const topoRoutes = topo.lines
        .map((line) => byId.get(line.idRoute))
        .filter((route): route is Route => !!route);

      for (const route of topoRoutes) placed.add(route.id);

      if (topoRoutes.length > 0) {
        grouped.push({
          id: topo.id,
          label: photoLabel(index),
          routes: sortByNumber(topoRoutes, numberOf)
        });
      }
    }

    const rest = routes.filter((route) => !placed.has(route.id));

    if (rest.length > 0) {
      grouped.push({
        id: 'rest',
        label: t`Not on a photo`,
        routes: sortByNumber(rest, numberOf)
      });
    }

    return grouped;
  }, [routes, topos, numberOf, t, photoLabel]);
};
