import type { OfflineSource } from '@crag-atlas/analytics';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';

import { useApiGetRegion } from '@web/shared/api';
import { formatBytes, useIsOnline } from '@web/shared/lib';

import { progressPercentOf } from '../lib';
import { useOfflineDownload } from '../providers';
import { useConnectionHint } from './useConnectionHint';
import { useDownloadSpeed } from './useDownloadSpeed';
import { useProgressLabel } from './useProgressLabel';

export type SaveRegionStage = 'intro' | 'downloading' | 'success' | 'error';

export const useSaveRegionOffline = (
  idRegion: string,
  source: OfflineSource
) => {
  const { t, i18n } = useLingui();
  const isOnline = useIsOnline();
  const { region } = useApiGetRegion(idRegion);
  const download = useOfflineDownload();
  const isConnectionSlow = useConnectionHint();
  const isThisRegion = (id: string | null) => id === idRegion;
  const progress = isThisRegion(download.idDownloading)
    ? download.progress
    : null;
  const { bytesPerSecond, isSlow: isDownloadSlow } = useDownloadSpeed(progress);

  const stage: SaveRegionStage = isThisRegion(download.idDownloading)
    ? 'downloading'
    : isThisRegion(download.idSaved)
      ? 'success'
      : isThisRegion(download.idFailed)
        ? 'error'
        : 'intro';

  const { bytes = 0 } = progress ?? {};
  const perSecond =
    bytesPerSecond === null ? null : formatBytes(bytesPerSecond, i18n.locale);
  const speed = perSecond === null ? null : t`${perSecond}/s`;
  const progressLabel = useProgressLabel(progress, stage === 'downloading');

  return {
    stage,
    region,
    isOnline,
    canDownload: isOnline && !!region && download.idDownloading === null,
    isConnectionSlow: isConnectionSlow === true || isDownloadSlow,
    progressLabel,
    progressPercent: progressPercentOf(progress),
    downloaded: bytes ? formatBytes(bytes, i18n.locale) : null,
    speed,
    errorMessage:
      stage === 'error'
        ? resolveFailureMessage(toFailure(download.error))
        : null,
    download: () => download.downloadRegion(idRegion, source).catch(() => {})
  };
};
