import { isFailure } from '@crag-atlas/utils';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cached data is served on the first frame and refreshed in the
      // background — that, not the request count, is what stops a page from
      // flashing a placeholder every time it is opened.
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      // A domain failure (404, validation) is an answer, not a hiccup: repeating
      // the request only delays the message the user is waiting for.
      retry: (failureCount, error) =>
        isFailure(error) && error.kind === 'domain' ? false : failureCount < 1
    }
  }
});
