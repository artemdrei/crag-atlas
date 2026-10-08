import type { FeedbackPage } from '@crag-atlas/api';
import { toFailure } from '@crag-atlas/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS } from '@web/shared/api';

export const useApiFeedback = () => {
  const { isAuthenticated, isLoading: isSessionLoading } = useUser();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.feedback(),
    queryFn: ({ pageParam }) =>
      apiGet<FeedbackPage>(
        pageParam
          ? `/feedback?cursor=${encodeURIComponent(pageParam)}`
          : '/feedback'
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated
  });

  return {
    feedback: data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: isSessionLoading || isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    failure: error ? toFailure(error) : null,
    loadMore: fetchNextPage
  };
};
