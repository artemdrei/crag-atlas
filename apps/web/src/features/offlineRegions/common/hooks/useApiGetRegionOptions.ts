import type { Region } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetRegionOptions = () => {
  const { data, isLoading } = useApiQuery({
    queryKey: QUERY_KEYS.regionList(false),
    queryFn: () => apiGet<Region[]>('/regions')
  });

  return { regions: data ?? [], isLoading };
};
