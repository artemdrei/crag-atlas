import { isFailure } from '@crag-atlas/utils';
import { QueryClient } from '@tanstack/react-query';

import { QUERY_CACHE_MAX_AGE } from './queryPersister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Served on the first frame and refreshed in the background: what stops
      // a page flashing a placeholder every time it opens.
      staleTime: 5 * 60 * 1000,
      // A query collected from memory is dropped from the persisted cache too.
      gcTime: QUERY_CACHE_MAX_AGE,
      refetchOnWindowFocus: false,
      // The default never runs a query while the browser reports offline, so
      // an offline region would wait forever instead of reaching the service
      // worker's copy.
      networkMode: 'offlineFirst',
      // A domain failure (404, validation) is an answer, not a hiccup.
      retry: (failureCount, error) =>
        isFailure(error) && error.kind === 'domain' ? false : failureCount < 1
    }
  }
});
