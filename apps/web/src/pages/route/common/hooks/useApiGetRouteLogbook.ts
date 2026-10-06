import type { Tick } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetRouteLogbook = (idRoute: string, isEnabled = true) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.routeLogbook(idRoute),
    queryFn: () => apiGet<Tick[]>(`/routes/${idRoute}/ticks`),
    enabled: isEnabled
  });

  return { ticks: data ?? [], isLoading, failure };
};
