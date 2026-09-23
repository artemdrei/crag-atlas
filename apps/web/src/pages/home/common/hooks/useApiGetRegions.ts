import {
  apiGet,
  QUERY_KEYS,
  useApiQuery,
  useSeedDetailCache
} from '@web/shared/api';

import type { Region } from '../entities';

export const useApiGetRegions = (isArchiveOnly = false) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.regionList(isArchiveOnly),
    queryFn: () =>
      apiGet<Region[]>(`/regions${isArchiveOnly ? '/archived' : ''}`)
  });

  useSeedDetailCache(data, QUERY_KEYS.region);

  return { regions: data ?? [], isLoading, failure };
};
