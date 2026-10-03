import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@web/shared/api';

import { readOfflineRegions, refreshRegion, warmAppForOffline } from '../lib';

const HOUR_MS = 60 * 60 * 1000;
const STALE_ON_LAUNCH_MS = 24 * HOUR_MS;
// Signal at a crag drops and returns every few minutes, and each return would
// otherwise re-download every saved region.
const STALE_ON_RECONNECT_MS = HOUR_MS;

const refreshRegions = async (staleAfterMs: number) => {
  const regions = Object.values(await readOfflineRegions());

  if (!regions.length) return;

  // A release ships new chunks; the saved regions must open on them offline
  // even when the regions themselves are still fresh.
  await warmAppForOffline().catch(() => {});

  for (const region of regions) {
    if (Date.now() - region.savedAt > staleAfterMs) {
      await refreshRegion(region.id).catch(() => {});
    }
  }
};

export const useOfflineRegionsSync = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = (staleAfterMs: number) =>
      refreshRegions(staleAfterMs).then(() =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.offlineRegions()
        })
      );

    const onReconnect = () => refresh(STALE_ON_RECONNECT_MS);

    if (navigator.onLine) refresh(STALE_ON_LAUNCH_MS);

    addEventListener('online', onReconnect);

    return () => removeEventListener('online', onReconnect);
  }, [isAuthenticated, queryClient]);
};
