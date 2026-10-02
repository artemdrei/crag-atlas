import { useMemo, useState } from 'react';

import { toSearchOptions } from '../lib';
import { useApiSearchCatalog } from './useApiSearchCatalog';

export const useCatalogSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, isActive, hasTerm } = useApiSearchCatalog(query);

  const options = useMemo(() => toSearchOptions(results), [results]);

  return {
    query,
    options,
    isLoading,
    isActive,
    isShown: isOpen && hasTerm,
    close: () => setIsOpen(false),
    clear: () => {
      setQuery('');
      setIsOpen(false);
    },
    open: () => setIsOpen(true),
    change: (next: string) => {
      setQuery(next);
      setIsOpen(true);
    }
  };
};
