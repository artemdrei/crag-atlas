import type { Tick } from '@crag-atlas/api';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetRouteTicks = (idRoute: string) => {
  const { isAuthenticated, isLoading: isSessionLoading } = useUser();

  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.routeTicks(idRoute),
    queryFn: () => apiGet<Tick[]>(`/ticks?idRoute=${idRoute}`),
    enabled: isAuthenticated
  });

  return {
    ticks: data ?? [],
    isLoading: isSessionLoading || isLoading,
    failure
  };
};
