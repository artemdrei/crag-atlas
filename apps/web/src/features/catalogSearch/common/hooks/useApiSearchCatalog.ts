import { useEffect, useRef } from 'react';

import { track } from '@crag-atlas/analytics';
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

  const results = data ?? EMPTY;
  const resultCount =
    results.regions.length + results.sectors.length + results.routes.length;

  const reportedTerm = useRef<string>('');

  // A refetch hands back a new data object for a term already reported.
  useEffect(() => {
    if (!data || reportedTerm.current === debouncedTerm) return;

    reportedTerm.current = debouncedTerm;

    track({
      name: 'Search Performed',
      props: {
        term_length: debouncedTerm.length,
        result_count: resultCount,
        has_results: resultCount > 0
      }
    });
  }, [debouncedTerm, data, resultCount]);

  return {
    results,
    isLoading: isLoading || debouncedTerm !== term,
    isActive
  };
};
