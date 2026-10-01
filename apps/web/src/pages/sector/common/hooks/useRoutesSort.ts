import { useState } from 'react';

import { trackListControl } from '@web/shared/lib';

import type { RouteSort, RouteSortDirection } from '../entities';

export const useRoutesSort = () => {
  const [sort, setSort] = useState<RouteSort>('default');
  const [direction, setDirection] = useState<RouteSortDirection>('desc');

  const changeSort = (next: RouteSort) => {
    trackListControl('routes', 'sort', next);
    setSort(next);
  };

  const toggleDirection = () => {
    const next = direction === 'asc' ? 'desc' : 'asc';

    trackListControl('routes', 'sort_direction', next);
    setDirection(next);
  };

  return { sort, direction, changeSort, toggleDirection };
};
