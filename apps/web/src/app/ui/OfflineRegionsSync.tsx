import { useUser } from '@web/app/providers';
import { useOfflineRegionsSync } from '@web/features/offlineRegions';

export const OfflineRegionsSync = () => {
  const { isAuthenticated } = useUser();

  useOfflineRegionsSync(isAuthenticated);

  return null;
};
