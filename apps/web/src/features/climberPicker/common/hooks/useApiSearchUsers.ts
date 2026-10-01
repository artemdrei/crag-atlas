import type { UserSummary } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiSearch } from '@web/shared/api';

export const useApiSearchUsers = (query: string) => {
  const { results, isLoading, term } = useApiSearch<UserSummary>({
    query,
    queryKey: QUERY_KEYS.userSearch,
    queryFn: (term) =>
      apiGet<UserSummary[]>(`/users?q=${encodeURIComponent(term)}`)
  });

  return { climbers: results, isLoading, term };
};
