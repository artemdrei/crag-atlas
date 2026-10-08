import { useModal } from '@web/app/providers';
import { useIsOnline } from '@web/shared/lib';

import { progressPercentOf } from '../lib';
import { useOfflineDownload } from '../providers';
import { useOfflineRegions } from './useOfflineRegions';

export const useOfflineRegionCta = (idRegion: string) => {
  const isOnline = useIsOnline();
  const { offlineRegions, isLoading } = useOfflineRegions();
  const { idDownloading, progress, reset } = useOfflineDownload();
  const { openModal } = useModal();

  const isSaved = offlineRegions.some((region) => region.id === idRegion);
  const isDownloading = idDownloading === idRegion;

  return {
    isVisible: isOnline && !isLoading && !isSaved,
    isDownloading,
    progressPercent: progressPercentOf(isDownloading ? progress : null),
    // A region removed in the profile would otherwise reopen on its old
    // success screen.
    open: () => {
      if (!isDownloading) reset();
      openModal('SAVE_REGION_OFFLINE', { idRegion });
    }
  };
};
