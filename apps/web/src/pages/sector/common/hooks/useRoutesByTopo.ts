import { useMemo } from 'react';

import type { Topo } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { sortByNumber, usePhotoLabel } from '@web/features/topo';

import type { Route, RouteSort, RouteSortDirection } from '../entities';
import { sortRoutes } from '../lib';

export interface RouteGroup {
  id: string;
  label: string;
  routes: Route[];
}

export interface Params {
  routes: Route[];
  topos: Topo[];
  numberOf: Record<string, number>;
  sort: RouteSort;
  direction: RouteSortDirection;
  gradeOrder: Record<string, number>;
}

export const useRoutesByTopo = ({
  routes,
  topos,
  numberOf,
  sort,
  direction,
  gradeOrder
}: Params): RouteGroup[] => {
  const { t } = useLingui();
  const photoLabel = usePhotoLabel();

  return useMemo(() => {
    // Photo groups carry their own order, so another sort replaces them.
    if (sort !== 'default')
      return [
        {
          id: 'all',
          label: '',
          routes: sortRoutes(routes, sort, direction, gradeOrder)
        }
      ];

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
  }, [routes, topos, numberOf, sort, direction, gradeOrder, t, photoLabel]);
};
