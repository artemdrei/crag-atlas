import { useMemo } from 'react';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiGetTickedRoutes = (
  idSector: string,
  visibleRoutes: readonly { id: string }[]
) => {
  const { isAuthenticated } = useUser();

  const { data } = useApiQuery({
    queryKey: QUERY_KEYS.routesTicked(idSector),
    queryFn: () => apiGet<string[]>(`/sectors/${idSector}/routes/ticked`),
    enabled: isAuthenticated && !!idSector
  });

  const tickedRoutes = useMemo(() => new Set(data ?? []), [data]);

  const tickedCount = useMemo(
    () =>
      isAuthenticated
        ? visibleRoutes.filter(({ id }) => tickedRoutes.has(id)).length
        : undefined,
    [isAuthenticated, tickedRoutes, visibleRoutes]
  );

  return { tickedRoutes, tickedCount };
};
