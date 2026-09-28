import type { CatalogSearch } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@web/shared/lib';

import { MIN_SEARCH_LENGTH } from '../lib';

const EMPTY: CatalogSearch = { regions: [], sectors: [], routes: [] };

export const useApiSearchCatalog = (query: string) => {
  const term = query.trim();
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const isActive = term.length >= MIN_SEARCH_LENGTH;

  const { data, isLoading } = useApiQuery({
    queryKey: QUERY_KEYS.catalogSearch(debouncedTerm),
    queryFn: () =>
      apiGet<CatalogSearch>(
        `/catalog/search?query=${encodeURIComponent(debouncedTerm)}`
      ),
    enabled: debouncedTerm.length >= MIN_SEARCH_LENGTH
  });

  return {
    results: data ?? EMPTY,
    isLoading: isLoading || debouncedTerm !== term,
    isActive
  };
};
