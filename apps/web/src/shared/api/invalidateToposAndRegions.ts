import type { QueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from './queryKeys';

/**
 * A sector's card shows its first photo, and that card is listed under a
 * region the topo hooks have no id for — so every topo write refreshes both.
 */
export const invalidateToposAndRegions = (
  queryClient: QueryClient,
  idSector: string
): Promise<unknown> =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() })
  ]);
