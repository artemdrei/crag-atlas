import {
  apiGet,
  QUERY_KEYS,
  useApiQuery,
  useSeedDetailCache
} from '@web/shared/api';

import type { Sector } from '../entities';

export const useApiGetSectors = (idRegion: string, isArchiveOnly = false) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.sectorList(idRegion, isArchiveOnly),
    queryFn: () =>
      apiGet<Sector[]>(
        `/regions/${idRegion}/sectors${isArchiveOnly ? '/archived' : ''}`
      )
  });

  useSeedDetailCache(data, QUERY_KEYS.sector);

  return { sectors: data ?? [], isLoading, failure };
};
