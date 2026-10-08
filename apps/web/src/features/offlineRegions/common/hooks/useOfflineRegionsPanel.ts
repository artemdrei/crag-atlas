import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';

import { buildRegionPath } from '@web/app/router/routes';
import {
  formatBytes,
  formatDateTime,
  toast,
  useIsOnline
} from '@web/shared/lib';

import { progressPercentOf } from '../lib';
import { useOfflineDownload } from '../providers';
import { useDeleteOfflineRegion } from './useDeleteOfflineRegion';
import { useOfflineRegions } from './useOfflineRegions';
import { useProgressLabel } from './useProgressLabel';

export const useOfflineRegionsPanel = () => {
  const { t, i18n } = useLingui();
  const isOnline = useIsOnline();
  const { offlineRegions } = useOfflineRegions();
  const { downloadRegion, idDownloading, progress } = useOfflineDownload();
  const { deleteRegion } = useDeleteOfflineRegion();

  const progressLabel = useProgressLabel(progress);

  const save = async (idRegion: string) => {
    try {
      await downloadRegion(idRegion, 'profile');
      toast.success(t`Saved for offline use`);
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  };

  return {
    isOnline,
    isDownloading: idDownloading !== null,
    save,
    progressLabel,
    progressPercent: progressPercentOf(progress),
    rows: offlineRegions.map((region) => {
      const size = formatBytes(region.bytes, i18n.locale);
      const savedAt = formatDateTime(
        new Date(region.savedAt).toISOString(),
        i18n.locale
      );

      return {
        id: region.id,
        name: region.name,
        path: buildRegionPath(region.id),
        details: t`${size} · saved ${savedAt}`,
        isRefreshing: idDownloading === region.id
      };
    }),
    refresh: save,
    remove: deleteRegion
  };
};
