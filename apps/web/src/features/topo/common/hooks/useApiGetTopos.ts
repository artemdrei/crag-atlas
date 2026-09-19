import type { Topo } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetTopos = (idSector: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.topos(idSector),
    queryFn: () => apiGet<Topo[]>(`/sectors/${idSector}/topos`)
  });

  return { topos: data ?? [], isLoading, failure };
};
