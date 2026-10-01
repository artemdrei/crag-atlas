import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

// A list response already holds every row a detail page will ask for, so the
// detail renders from cache on the first frame instead of flashing empty.
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
