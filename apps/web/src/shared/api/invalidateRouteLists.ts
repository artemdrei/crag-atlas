import type { QueryClient } from '@tanstack/react-query';

/**
 * A route row carries marks of its own — a rating, whether anyone left a photo
 * or a video — so writing one refreshes the lists it appears in, and the tick
 * counts drawn beside them. Matching on the key leaves the topos cached under
 * the same sector alone.
 */
export const invalidateRouteLists = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      (queryKey[0] === 'sectors' && queryKey[3] === 'routes') ||
      (queryKey[0] === 'regions' &&
        queryKey[3] === 'sectors' &&
        queryKey[4] === 'ticked')
  });
