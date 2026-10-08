import type { Region } from '@crag-atlas/api';

import { apiGet } from './httpClient';
import { QUERY_KEYS } from './queryKeys';
import { useApiQuery } from './useApiQuery';

export const useApiGetRegion = (idRegion: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.region(idRegion),
    queryFn: () => apiGet<Region>(`/regions/${idRegion}`)
  });

  return { region: data ?? null, isLoading, failure };
};
