import type { UserSummary } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@web/shared/lib';

const EMPTY: UserSummary[] = [];

export const MIN_SEARCH_LENGTH = 2;

export const useApiSearchUsers = (query: string) => {
  const term = query.trim();
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);

  const { data, isLoading } = useApiQuery({
    queryKey: QUERY_KEYS.userSearch(debouncedTerm),
    queryFn: () =>
      apiGet<UserSummary[]>(`/users?q=${encodeURIComponent(debouncedTerm)}`),
    enabled: debouncedTerm.length >= MIN_SEARCH_LENGTH
  });

  return {
    climbers: data ?? EMPTY,
    isLoading: isLoading || debouncedTerm !== term,
    term
  };
};
