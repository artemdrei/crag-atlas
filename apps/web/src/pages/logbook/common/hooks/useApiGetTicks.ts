import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import type { Tick } from '../entities';

export const useApiGetTicks = () => {
  const { isAuthenticated, isLoading: isSessionLoading } = useUser();

  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.ticks(),
    queryFn: () => apiGet<Tick[]>('/ticks'),
    // Without the session the request is a guaranteed 401; the page shows
    // loading until it resolves rather than an error it cannot act on.
    enabled: isAuthenticated
  });

  return {
    ticks: data ?? [],
    isLoading: isSessionLoading || isLoading,
    failure
  };
};
