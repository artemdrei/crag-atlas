import type { VideoPage } from '@crag-atlas/api';
import { toFailure } from '@crag-atlas/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

import { apiGet, QUERY_KEYS } from '@web/shared/api';
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@web/shared/lib';

import type { VideoFilters } from '../entities';

export const useApiGetVideos = (filters: VideoFilters) => {
  const query = useDebouncedValue(filters.query.trim(), SEARCH_DEBOUNCE_MS);

  const params = new URLSearchParams();

  if (query) params.set('query', query);
  if (filters.gradeFrom) params.set('gradeFrom', filters.gradeFrom);
  if (filters.gradeTo) params.set('gradeTo', filters.gradeTo);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);

  const search = params.toString();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.videoPage(search),
    queryFn: ({ pageParam }) => {
      const page = new URLSearchParams(search);

      if (pageParam) page.set('cursor', pageParam);

      const suffix = page.toString();

      return apiGet<VideoPage>(suffix ? `/videos?${suffix}` : '/videos');
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });

  return {
    videos: data?.pages.flatMap((page) => page.items) ?? [],
    total: data?.pages[0]?.total,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    failure: error ? toFailure(error) : null,
    loadMore: fetchNextPage
  };
};
