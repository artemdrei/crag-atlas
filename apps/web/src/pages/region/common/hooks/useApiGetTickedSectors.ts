import { useMemo } from 'react';

import type { SectorTickCount } from '@crag-atlas/api';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetTickedSectors = (idRegion: string) => {
  const { isAuthenticated } = useUser();

  const { data } = useApiQuery({
    queryKey: QUERY_KEYS.sectorsTicked(idRegion),
    queryFn: () =>
      apiGet<SectorTickCount[]>(`/regions/${idRegion}/sectors/ticked`),
    enabled: isAuthenticated && !!idRegion
  });

  const tickedOf = useMemo(
    () =>
      isAuthenticated
        ? Object.fromEntries(
            (data ?? []).map(({ idSector, tickedCount }) => [
              idSector,
              tickedCount
            ])
          )
        : undefined,
    [data, isAuthenticated]
  );

  const tickedRoutes = useMemo(
    () => new Set((data ?? []).flatMap(({ idRoutes }) => idRoutes)),
    [data]
  );

  return { tickedOf, tickedRoutes };
};
