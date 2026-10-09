import { useEffect, useSyncExternalStore } from 'react';

import { useModal, useUser } from '@web/app/providers';
import {
  getUsageState,
  isStandalone,
  recordPromptShown,
  recordUsageSession,
  subscribeUsageState,
  wasPromptShownToday
} from '@web/shared/lib';

import {
  getInstallHintState,
  markInstallHintInstalled,
  recordInstallHintShown,
  shouldShowInstallHint,
  subscribeInstallHintState
} from '../lib';

export const useInstallHintTrigger = () => {
  const { openModal, getOpenedModals } = useModal();
  const { isAuthenticated } = useUser();
  const state = useSyncExternalStore(
    subscribeInstallHintState,
    getInstallHintState
  );
  const usage = useSyncExternalStore(subscribeUsageState, getUsageState);

  useEffect(() => {
    if (isStandalone()) markInstallHintInstalled();
    else recordUsageSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !shouldShowInstallHint(state, usage)) return;
    if (wasPromptShownToday(usage) || getOpenedModals().length) return;

    recordInstallHintShown();
    recordPromptShown();
    openModal('INSTALL_HINT');
  }, [isAuthenticated, state, usage, openModal, getOpenedModals]);
};
