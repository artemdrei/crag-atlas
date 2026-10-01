import type { AdminCandidate } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiSearch } from '@web/shared/api';

export const useApiAdminCandidates = (query: string) => {
  const { results, isLoading, failure, term } = useApiSearch<AdminCandidate>({
    query,
    queryKey: QUERY_KEYS.adminCandidates,
    queryFn: (term) =>
      apiGet<AdminCandidate[]>(
        `/admins/candidates?q=${encodeURIComponent(term)}`
      )
  });

  return { candidates: results, isLoading, failure, term };
};
