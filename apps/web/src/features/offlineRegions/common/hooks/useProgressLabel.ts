import { useLingui } from '@lingui/react/macro';

import type { DownloadProgress } from '../entities';

export const useProgressLabel = (
  progress: DownloadProgress | null,
  isActive = !!progress
): string | null => {
  const { t } = useLingui();

  if (!isActive) return null;

  const { done = 0, total = 0 } = progress ?? {};

  return total
    ? t`Downloading photos: ${done} of ${total}`
    : t`Preparing the download…`;
};
