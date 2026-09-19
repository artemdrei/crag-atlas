import {
  apiGet,
  QUERY_KEYS,
  useApiQuery,
  useSeedDetailCache
} from '@web/shared/api';

import type { Route } from '../entities';

export const useApiGetRoutes = (idSector: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.routes(idSector),
    queryFn: () => apiGet<Route[]>(`/sectors/${idSector}/routes`)
  });

  useSeedDetailCache(data, QUERY_KEYS.route);

  return { routes: data ?? [], isLoading, failure };
};
