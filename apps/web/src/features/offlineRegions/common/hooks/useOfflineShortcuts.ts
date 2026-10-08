import { buildRegionPath } from '@web/app/router/routes';
import { useIsOnline } from '@web/shared/lib';

import { useOfflineRegions } from './useOfflineRegions';

// Reads the saved index only, never the session: offline, an expired token
// leaves the climber looking like a guest, and the saved regions must still
// be one tap away. navigator.onLine stays true on Wi-Fi without internet or
// against a sleeping API, so a catalog that failed to load counts as offline.
export const useOfflineShortcuts = (isCatalogUnavailable: boolean) => {
  const isOnline = useIsOnline();
  const { offlineRegions } = useOfflineRegions();

  return {
    isVisible: (!isOnline || isCatalogUnavailable) && offlineRegions.length > 0,
    links: offlineRegions.map((region) => ({
      id: region.id,
      name: region.name,
      path: buildRegionPath(region.id)
    }))
  };
};
