import {
  apiGet,
  QUERY_KEYS,
  useApiQuery,
  useSeedDetailCache
} from '@web/shared/api';

import type { Route } from '../entities';

export const useApiGetRoutes = (
  idSector: string,
  isArchiveOnly = false,
  isEnabled = true
) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.routeList(idSector, isArchiveOnly),
    queryFn: () =>
      apiGet<Route[]>(
        `/sectors/${idSector}/routes${isArchiveOnly ? '/archived' : ''}`
      ),
    enabled: isEnabled
  });

  useSeedDetailCache(data, QUERY_KEYS.route);

  return { routes: data ?? [], isLoading, failure };
};
