import { useState } from 'react';

import type { Region } from '@crag-atlas/api';

import { useOfflineDownload } from '../providers';
import { useApiGetRegionOptions } from './useApiGetRegionOptions';
import { useOfflineRegions } from './useOfflineRegions';

const fold = (value: string) =>
  value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const matchesQuery = (region: Region, query: string) =>
  [region.name, region.nameLocal].some(
    (name) => name && fold(name).includes(query)
  );

export const useOfflineRegionChoice = () => {
  const { regions, isLoading } = useApiGetRegionOptions();
  const { offlineRegions } = useOfflineRegions();
  const { idDownloading } = useOfflineDownload();
  const [selected, setSelected] = useState<Region | null>(null);
  const [query, setQuery] = useState('');

  const savedIds = new Set(offlineRegions.map((region) => region.id));
  const normalizedQuery = fold(query.trim());

  return {
    options: regions.filter(
      (region) =>
        !savedIds.has(region.id) && matchesQuery(region, normalizedQuery)
    ),
    isLoading,
    query,
    search: setQuery,
    selected,
    select: setSelected,
    isPickable:
      idDownloading === null && !(selected && savedIds.has(selected.id))
  };
};
