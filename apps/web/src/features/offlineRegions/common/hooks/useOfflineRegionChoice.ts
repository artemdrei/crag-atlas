import { useState } from 'react';

import type { Region } from '@crag-atlas/api';

import { useOfflineDownload } from '../providers';
import { useApiGetRegionOptions } from './useApiGetRegionOptions';
import { useOfflineRegions } from './useOfflineRegions';

export const useOfflineRegionChoice = () => {
  const { regions, isLoading } = useApiGetRegionOptions();
  const { offlineRegions } = useOfflineRegions();
  const { idDownloading } = useOfflineDownload();
  const [selected, setSelected] = useState<Region | null>(null);

  const savedIds = new Set(offlineRegions.map((region) => region.id));

  return {
    options: regions.filter((region) => !savedIds.has(region.id)),
    isLoading,
    selected,
    select: setSelected,
    isPickable:
      idDownloading === null && !(selected && savedIds.has(selected.id))
  };
};
