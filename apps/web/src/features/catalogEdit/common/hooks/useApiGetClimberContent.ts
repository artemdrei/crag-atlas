import type { ClimberContent } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export type ContentScope = 'regions' | 'sectors' | 'routes';

export const useApiGetClimberContent = (scope: ContentScope, id: string) => {
  const { data, isLoading } = useApiQuery({
    queryKey: QUERY_KEYS.climberContent(scope, id),
    queryFn: () => apiGet<ClimberContent>(`/${scope}/${id}/content`)
  });

  return { content: data ?? null, isLoading };
};
