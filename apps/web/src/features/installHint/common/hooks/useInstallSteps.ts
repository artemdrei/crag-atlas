import { isIOS } from 'react-device-detect';

import { useLingui } from '@lingui/react/macro';

export const useInstallSteps = (): string[] => {
  const { t } = useLingui();

  if (isIOS) {
    return [
      t`Open this page in Safari. Tap the Share button (a square with an arrow) at the bottom of the screen. On iOS 26 it is behind the ⋯ button next to the address bar.`,
      t`Scroll the list down and tap "Add to Home Screen".`,
      t`Tap "Add" in the top right corner. The crag-atlas icon appears on your home screen.`
    ];
  }

  return [
    t`Open this page in Chrome. Tap the ⋮ button in the top right corner.`,
    t`Tap "Add to Home screen", then choose "Install". Older Chrome shows "Install app" right away.`,
    t`Confirm. The crag-atlas icon appears with your other apps.`
  ];
};
