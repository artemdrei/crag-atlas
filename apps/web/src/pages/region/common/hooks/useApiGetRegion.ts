import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import type { Region } from '../entities';

export const useApiGetRegion = (idRegion: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.region(idRegion),
    queryFn: () => apiGet<Region>(`/regions/${idRegion}`)
  });

  return { region: data ?? null, isLoading, failure };
};
