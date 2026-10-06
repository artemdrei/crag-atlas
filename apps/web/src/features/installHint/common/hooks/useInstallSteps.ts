import { isIOS } from 'react-device-detect';

import { useLingui } from '@lingui/react/macro';

export const useInstallSteps = (): string[] => {
  const { t } = useLingui();

  if (isIOS) {
    return [
      t`Open this page in Safari and tap Share in the toolbar.`,
      t`Scroll down and tap Add to Home Screen.`,
      t`Tap Add. crag-atlas appears on your home screen.`
    ];
  }

  return [
    t`Open this page in Chrome and tap the ⋮ menu.`,
    t`Tap Install app or Add to Home screen.`,
    t`Confirm. crag-atlas appears with your other apps.`
  ];
};
