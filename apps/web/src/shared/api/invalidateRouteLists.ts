import type { QueryClient } from '@tanstack/react-query';

// A route row carries marks of its own, so writing one refreshes the lists it
// appears in. Matching on the key leaves the sector's topos cached.
export const invalidateRouteLists = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      (queryKey[0] === 'sectors' && queryKey[3] === 'routes') ||
      (queryKey[0] === 'regions' && queryKey[3] === 'sectors')
  });
