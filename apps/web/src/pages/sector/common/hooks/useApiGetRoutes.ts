import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Route } from '../entities';

export const useApiGetRoutes = (idSector: string) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRoutes = async () => {
      setIsLoading(true);
      setFailure(null);

      try {
        const data = await apiGet<Route[]>(`/sectors/${idSector}/routes`);
        if (!cancelled) setRoutes(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRoutes();

    return () => {
      cancelled = true;
    };
  }, [idSector]);

  return { routes, isLoading, failure };
};
