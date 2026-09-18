import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Sector } from '../entities';

export const useApiGetSectors = (regionId: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSectors = async () => {
      setIsLoading(true);
      setFailure(null);

      try {
        const data = await apiGet<Sector[]>(`/regions/${regionId}/sectors`);
        if (!cancelled) setSectors(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchSectors();

    return () => {
      cancelled = true;
    };
  }, [regionId]);

  return { sectors, isLoading, failure };
};
