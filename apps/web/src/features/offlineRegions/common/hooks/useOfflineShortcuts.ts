import { buildRegionPath } from '@web/app/router/routes';

import { useIsOnline } from './useIsOnline';
import { useOfflineRegions } from './useOfflineRegions';

// Reads the saved index only, never the session: offline, an expired token
// leaves the climber looking like a guest, and the saved regions must still
// be one tap away.
export const useOfflineShortcuts = () => {
  const isOnline = useIsOnline();
  const { offlineRegions } = useOfflineRegions();

  return {
    isVisible: !isOnline && offlineRegions.length > 0,
    links: offlineRegions.map((region) => ({
      id: region.id,
      name: region.name,
      path: buildRegionPath(region.id)
    }))
  };
};
