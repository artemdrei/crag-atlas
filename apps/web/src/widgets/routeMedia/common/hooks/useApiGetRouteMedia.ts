import type { RouteMedia } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetRouteMedia = (idRoute: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.routeMedia(idRoute),
    queryFn: () => apiGet<RouteMedia[]>(`/routes/${idRoute}/media`)
  });

  return { media: data ?? [], isLoading, failure };
};
