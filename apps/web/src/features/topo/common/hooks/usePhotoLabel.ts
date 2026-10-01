import { useCallback } from 'react';

import { useLingui } from '@lingui/react/macro';

// Named by position in the sector, so the name follows a reorder on its own.
export const usePhotoLabel = () => {
  const { t } = useLingui();

  return useCallback((index: number) => t`Photo ${index + 1}`, [t]);
};
