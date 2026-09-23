import type { UserSummary } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const MIN_SEARCH_LENGTH = 2;

export const useApiSearchUsers = (query: string) => {
  const term = query.trim();

  const { data, isLoading } = useApiQuery({
    queryKey: QUERY_KEYS.userSearch(term),
    queryFn: () =>
      apiGet<UserSummary[]>(`/users?q=${encodeURIComponent(term)}`),
    enabled: term.length >= MIN_SEARCH_LENGTH
  });

  return { climbers: data ?? [], isLoading, term };
};
