import type { TickPage } from '@crag-atlas/api';
import { toFailure } from '@crag-atlas/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useUser } from '@web/app/providers';
import { apiGet, QUERY_KEYS } from '@web/shared/api';

import type { AscentFilter, Discipline, TickSort } from '../entities';

export interface Params {
  discipline: Discipline;
  ascentType: AscentFilter;
  sort: TickSort;
}

const buildQuery = ({ discipline, ascentType, sort }: Params, offset: number) =>
  new URLSearchParams({
    discipline,
    sort,
    offset: String(offset),
    ...(ascentType === 'all' ? {} : { ascentType })
  }).toString();

export const useApiGetTicks = (params: Params) => {
  const { isAuthenticated, isLoading: isSessionLoading } = useUser();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.ticksPage(buildQuery(params, 0)),
    queryFn: ({ pageParam }) =>
      apiGet<TickPage>(`/ticks?${buildQuery(params, pageParam)}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: isAuthenticated
  });

  const pages = data?.pages ?? [];
  // A tick logged while pages are loaded shifts every offset below it.
  const ticks = [
    ...new Map(
      pages.flatMap((page) => page.items).map((tick) => [tick.id, tick])
    ).values()
  ];

  return {
    ticks,
    total: pages[0]?.total ?? 0,
    isLoading: isSessionLoading || isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    failure: error ? toFailure(error) : null,
    loadMore: fetchNextPage
  };
};
