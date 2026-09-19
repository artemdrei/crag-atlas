import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import type { Sector } from '../entities';

export const useApiGetSector = (idSector: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.sector(idSector),
    queryFn: () => apiGet<Sector>(`/sectors/${idSector}`)
  });

  return { sector: data ?? null, isLoading, failure };
};
