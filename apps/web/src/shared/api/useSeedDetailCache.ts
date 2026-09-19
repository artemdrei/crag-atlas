import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

/**
 * A list response already contains every row a detail page will ask for, so
 * each row is written into its own cache entry as the list arrives. Opening an
 * item then renders from cache on the first frame instead of flashing empty
 * labels while its request runs; the detail query still refetches in the
 * background once the entry goes stale.
 */
export const useSeedDetailCache = <T extends { id: string }>(
  items: T[] | undefined,
  toQueryKey: (id: string) => readonly unknown[]
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!items) return;

    for (const item of items) {
      queryClient.setQueryData(toQueryKey(item.id), item);
    }
  }, [items, queryClient, toQueryKey]);
};
