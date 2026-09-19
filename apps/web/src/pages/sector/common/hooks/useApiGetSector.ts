import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Sector } from '../entities';

export const useApiGetSector = (idSector: string) => {
  const [sector, setSector] = useState<Sector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSector = async () => {
      try {
        const data = await apiGet<Sector>(`/sectors/${idSector}`);
        if (!cancelled) setSector(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchSector();

    return () => {
      cancelled = true;
    };
  }, [idSector]);

  return { sector, isLoading, failure };
};
