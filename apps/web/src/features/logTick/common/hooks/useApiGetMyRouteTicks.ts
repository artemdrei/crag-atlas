import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import type { Tick } from '../entities';

export const useApiGetMyRouteTicks = (idRoute: string, isEnabled = true) => {
  const { isAuthenticated } = useUser();
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.myRouteTicks(idRoute),
    queryFn: () => apiGet<Tick[]>(`/ticks/routes/${idRoute}`),
    enabled: isAuthenticated && isEnabled
  });

  return { ticks: data ?? [], isLoading, failure };
};
