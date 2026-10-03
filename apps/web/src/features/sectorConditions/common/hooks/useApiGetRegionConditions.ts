import type { SectorConditions } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

// The region's own point, so the card answers whether it is worth driving
// out at all. Sun and shade belong to a wall, and a region has none.
export const useApiGetRegionConditions = (idRegion: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.regionConditions(idRegion),
    queryFn: () => apiGet<SectorConditions>(`/regions/${idRegion}/conditions`)
  });

  return { conditions: data ?? null, isLoading, failure };
};
