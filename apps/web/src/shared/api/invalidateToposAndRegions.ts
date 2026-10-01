import type { QueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from './queryKeys';

// A sector's card shows its first photo, and that card sits under a region the
// topo hooks have no id for.
export const invalidateToposAndRegions = (
  queryClient: QueryClient,
  idSector: string
): Promise<unknown> =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() })
  ]);
