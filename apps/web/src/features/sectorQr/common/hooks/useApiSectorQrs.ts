import type { SectorQr } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export interface Params {
  idRegion?: string;
  idSector?: string;
}

export const useApiSectorQrs = ({ idRegion, idSector }: Params) => {
  const filter = new URLSearchParams({
    ...(idRegion ? { idRegion } : {}),
    ...(idSector ? { idSector } : {})
  }).toString();

  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.sectorQrs(filter),
    queryFn: () => apiGet<SectorQr[]>(`/qr-paths?${filter}`)
  });

  return { rows: data ?? [], isLoading, failure };
};
