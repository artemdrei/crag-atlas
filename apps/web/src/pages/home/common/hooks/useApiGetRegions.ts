import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Region } from '../entities';

export const useApiGetRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRegions = async () => {
      try {
        const data = await apiGet<Region[]>('/regions');
        if (!cancelled) setRegions(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { regions, isLoading, failure };
};
