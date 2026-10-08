import { createContext, useContext, useMemo, useRef, useState } from 'react';

import type { OfflineSource } from '@crag-atlas/analytics';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@web/app/providers';
import { recordInstallHintMoment } from '@web/features/installHint';
import { QUERY_KEYS } from '@web/shared/api';
import { failureCodeOf } from '@web/shared/lib';

import type { DownloadProgress } from '../entities';
import { downloadRegion, readOfflineRegions, trackOfflineAction } from '../lib';

interface OfflineDownloadContextValue {
  idDownloading: string | null;
  idFailed: string | null;
  idSaved: string | null;
  error: unknown;
  progress: DownloadProgress | null;
  downloadRegion: (idRegion: string, source: OfflineSource) => Promise<unknown>;
  reset: () => void;
}

interface DownloadVariables {
  idRegion: string;
  source: OfflineSource;
}

const OfflineDownloadContext =
  createContext<OfflineDownloadContextValue | null>(null);

export const OfflineDownloadProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUser();
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const lastProgress = useRef<DownloadProgress | null>(null);

  const {
    error,
    isError,
    isPending,
    isSuccess,
    mutateAsync,
    reset,
    variables
  } = useMutation({
    mutationFn: async ({ idRegion, source }: DownloadVariables) => {
      lastProgress.current = null;

      const isRefresh = !!(await readOfflineRegions())[idRegion];

      if (!isRefresh) {
        trackOfflineAction({
          action: 'save_started',
          id_region: idRegion,
          source
        });
      }

      // Without this the browser may evict the region to free space.
      await navigator.storage?.persist?.();

      const region = await downloadRegion(idRegion, isAuthenticated, (next) => {
        lastProgress.current = next;
        setProgress(next);
      });

      return { region, isRefresh };
    },
    onSuccess: ({ region, isRefresh }, { idRegion, source }) => {
      const startedAt = lastProgress.current?.startedAt;

      trackOfflineAction({
        action: isRefresh ? 'refreshed' : 'save_completed',
        id_region: idRegion,
        source,
        photo_count: lastProgress.current?.total ?? 0,
        bytes: region.bytes,
        duration_ms: startedAt ? Date.now() - startedAt : undefined
      });
      recordInstallHintMoment();
    },
    onError: (error, { idRegion, source }) => {
      trackOfflineAction({
        action: 'save_failed',
        id_region: idRegion,
        source,
        code: failureCodeOf(error)
      });
    },
    onSettled: () => {
      setProgress(null);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.offlineRegions()
      });
    }
  });

  const value = useMemo<OfflineDownloadContextValue>(
    () => ({
      idDownloading: isPending ? (variables?.idRegion ?? null) : null,
      idFailed: isError ? (variables?.idRegion ?? null) : null,
      idSaved: isSuccess ? (variables?.idRegion ?? null) : null,
      error,
      progress,
      downloadRegion: (idRegion, source) => mutateAsync({ idRegion, source }),
      reset
    }),
    [
      error,
      isError,
      isPending,
      isSuccess,
      mutateAsync,
      progress,
      reset,
      variables
    ]
  );

  return (
    <OfflineDownloadContext.Provider value={value}>
      {children}
    </OfflineDownloadContext.Provider>
  );
};

export const useOfflineDownload = () => {
  const context = useContext(OfflineDownloadContext);

  if (!context) {
    throw new Error(
      'useOfflineDownload must be used within OfflineDownloadProvider'
    );
  }

  return context;
};
