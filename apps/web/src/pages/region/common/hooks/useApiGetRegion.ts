import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Region } from '../entities';

export const useApiGetRegion = (idRegion: string) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRegion = async () => {
      try {
        const data = await apiGet<Region>(`/regions/${idRegion}`);
        if (!cancelled) setRegion(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRegion();

    return () => {
      cancelled = true;
    };
  }, [idRegion]);

  return { region, isLoading, failure };
};
