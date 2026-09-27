import type { TickStats } from '@crag-atlas/api';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetTickStats = () => {
  const { isAuthenticated } = useUser();

  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.tickStats(),
    queryFn: () => apiGet<TickStats>('/ticks/stats'),
    enabled: isAuthenticated
  });

  return { stats: data ?? null, isLoading, failure };
};
