import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@web/shared/api';

import type { DownloadProgress } from '../entities';
import { downloadRegion } from '../lib';

export const useDownloadOfflineRegion = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const { isPending, mutateAsync, variables } = useMutation({
    mutationFn: async (idRegion: string) => {
      // Without this the browser may evict the region to free space.
      await navigator.storage?.persist?.();

      return downloadRegion(idRegion, setProgress);
    },
    onSettled: () => {
      setProgress(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offlineRegions() });
    }
  });

  return {
    isDownloading: isPending,
    idDownloading: isPending ? variables : null,
    progress,
    downloadRegion: mutateAsync
  };
};
