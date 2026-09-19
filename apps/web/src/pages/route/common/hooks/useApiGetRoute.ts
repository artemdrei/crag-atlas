import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import type { Route } from '../entities';

export const useApiGetRoute = (idRoute: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.route(idRoute),
    queryFn: () => apiGet<Route>(`/routes/${idRoute}`)
  });

  return { route: data ?? null, isLoading, failure };
};
