import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Route } from '../entities';

export const useApiGetRoute = (routeId: string) => {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRoute = async () => {
      setIsLoading(true);
      setFailure(null);

      try {
        const data = await apiGet<Route>(`/routes/${routeId}`);
        if (!cancelled) setRoute(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
    };
  }, [routeId]);

  return { route, isLoading, failure };
};
