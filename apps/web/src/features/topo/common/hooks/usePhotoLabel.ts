import { useCallback } from 'react';

import { useLingui } from '@lingui/react/macro';

/** Photos are named by where they sit in the sector, never by the file that
    was uploaded: the name then follows a reorder on its own. */
export const usePhotoLabel = () => {
  const { t } = useLingui();

  return useCallback((index: number) => t`Photo ${index + 1}`, [t]);
};
