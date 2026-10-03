import type { SectorConditions } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

// The whole strip in one request: the provider publishes its window at once,
// so stepping to another day is a click and never a fetch.
export const useApiGetConditions = (idSector: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.sectorConditions(idSector),
    queryFn: () => apiGet<SectorConditions>(`/sectors/${idSector}/conditions`)
  });

  return { conditions: data ?? null, isLoading, failure };
};
