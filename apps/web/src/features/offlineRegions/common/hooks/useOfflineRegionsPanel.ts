import { useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';

import { buildRegionPath } from '@web/app/router/routes';
import { formatBytes, formatDateTime, toast } from '@web/shared/lib';

import { useApiGetRegionOptions } from './useApiGetRegionOptions';
import { useDeleteOfflineRegion } from './useDeleteOfflineRegion';
import { useDownloadOfflineRegion } from './useDownloadOfflineRegion';
import { useIsOnline } from './useIsOnline';
import { useOfflineRegions } from './useOfflineRegions';

export const useOfflineRegionsPanel = () => {
  const { t, i18n } = useLingui();
  const isOnline = useIsOnline();
  const { regions, isLoading: isRegionsLoading } = useApiGetRegionOptions();
  const { offlineRegions } = useOfflineRegions();
  const { downloadRegion, idDownloading, isDownloading, progress } =
    useDownloadOfflineRegion();
  const { deleteRegion } = useDeleteOfflineRegion();
  const [selected, setSelected] = useState<Region | null>(null);

  const savedIds = new Set(offlineRegions.map((region) => region.id));

  const save = async (idRegion: string) => {
    try {
      await downloadRegion(idRegion);
      toast.success(t`Saved for offline use`);
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  };

  const { done = 0, total = 0 } = progress ?? {};
  const progressLabel = !progress
    ? null
    : total
      ? t`Downloading photos: ${done} of ${total}`
      : t`Preparing the download…`;

  return {
    isOnline,
    isRegionsLoading,
    options: regions.filter((region) => !savedIds.has(region.id)),
    selected,
    select: setSelected,
    canDownload: isOnline && !!selected && !isDownloading,
    download: async () => {
      if (!selected) return;

      await save(selected.id);
      setSelected(null);
    },
    isDownloading,
    progressLabel,
    progressPercent: total ? (done / total) * 100 : null,
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
