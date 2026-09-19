import {
  apiGet,
  QUERY_KEYS,
  useApiQuery,
  useSeedDetailCache
} from '@web/shared/api';

import type { Region } from '../entities';

export const useApiGetRegions = () => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.regions(),
    queryFn: () => apiGet<Region[]>('/regions')
  });

  useSeedDetailCache(data, QUERY_KEYS.region);

  return { regions: data ?? [], isLoading, failure };
};
