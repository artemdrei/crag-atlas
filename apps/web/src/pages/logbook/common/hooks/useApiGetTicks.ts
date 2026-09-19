import { useEffect, useState } from 'react';

import { type Failure, toFailure } from '@crag-atlas/utils';

import { apiGet } from '@web/shared/api';

import type { Tick } from '../entities';

export const useApiGetTicks = () => {
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTicks = async () => {
      try {
        const data = await apiGet<Tick[]>('/ticks');
        if (!cancelled) setTicks(data);
      } catch (err) {
        if (!cancelled) setFailure(toFailure(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTicks();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ticks, isLoading, failure };
};
