import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import type { Sector } from '../entities';

export const useApiGetSectors = (idRegion: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.sectors(idRegion),
    queryFn: () => apiGet<Sector[]>(`/regions/${idRegion}/sectors`)
  });

  return { sectors: data ?? [], isLoading, failure };
};
