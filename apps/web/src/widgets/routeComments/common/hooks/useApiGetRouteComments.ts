import type { RouteComment } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetRouteComments = (idRoute: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.routeComments(idRoute),
    queryFn: () => apiGet<RouteComment[]>(`/routes/${idRoute}/comments`)
  });

  return { comments: data ?? [], isLoading, failure };
};
