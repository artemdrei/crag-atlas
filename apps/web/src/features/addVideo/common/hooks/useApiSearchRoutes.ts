import type { CatalogSearch } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiSearch } from '@web/shared/api';

import { routeOfHit } from '../lib';

export const useApiSearchRoutes = (query: string) => {
  const { results, isLoading, term } = useApiSearch({
    query,
    queryKey: (term) => [...QUERY_KEYS.catalogSearch(term), 'routes'],
    queryFn: async (debouncedTerm) => {
      const { routes } = await apiGet<CatalogSearch>(
        `/catalog/search?query=${encodeURIComponent(debouncedTerm)}`
      );

      return routes.map(routeOfHit);
    }
  });

  return { routes: results, isLoading: !!term && isLoading, term };
};
