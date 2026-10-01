import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@web/shared/lib';

import { useApiQuery } from './useApiQuery';

const EMPTY: never[] = [];

export const MIN_SEARCH_LENGTH = 2;

export interface Params<T> {
  query: string;
  queryKey: (term: string) => readonly unknown[];
  queryFn: (term: string) => Promise<T[]>;
}

export const useApiSearch = <T>({ query, queryKey, queryFn }: Params<T>) => {
  const term = query.trim();
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);

  const { data, isLoading, failure } = useApiQuery({
    queryKey: queryKey(debouncedTerm),
    queryFn: () => queryFn(debouncedTerm),
    enabled: debouncedTerm.length >= MIN_SEARCH_LENGTH
  });

  return {
    results: data ?? EMPTY,
    isLoading: isLoading || debouncedTerm !== term,
    failure,
    term
  };
};
