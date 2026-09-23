import type { TickFeedPage } from '@crag-atlas/api';
import { toFailure } from '@crag-atlas/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS } from '@web/shared/api';

export const useApiGetTicksFeed = () => {
  const { isAuthenticated, isLoading: isSessionLoading } = useUser();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.ticksFeed(),
    queryFn: ({ pageParam }) =>
      apiGet<TickFeedPage>(
        pageParam
          ? `/ticks/feed?cursor=${encodeURIComponent(pageParam)}`
          : '/ticks/feed'
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated
  });

  return {
    ticks: data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: isSessionLoading || isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    failure: error ? toFailure(error) : null,
    loadMore: fetchNextPage
  };
};
