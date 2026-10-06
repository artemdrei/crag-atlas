import { useSyncExternalStore } from 'react';

import {
  consumeInstallPrompt,
  getInstallPrompt,
  subscribeInstallPrompt
} from '../lib';
import { useInstallSteps } from './useInstallSteps';

export const useInstallHint = () => {
  const steps = useInstallSteps();
  const canInstall = !!useSyncExternalStore(
    subscribeInstallPrompt,
    getInstallPrompt
  );

  const install = async () => {
    const event = consumeInstallPrompt();
    if (!event) return;

    try {
      await event.prompt();
    } catch {}
  };

  return { steps, canInstall, install };
};
