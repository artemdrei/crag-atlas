import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@web/shared/api';

import { readOfflineRegions } from '../lib';

export const useOfflineRegions = () => {
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.offlineRegions(),
    queryFn: async () =>
      Object.values(await readOfflineRegions()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    networkMode: 'always'
  });

  return { offlineRegions: data ?? [], isLoading: isPending };
};
