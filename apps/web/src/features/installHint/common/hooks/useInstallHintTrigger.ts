import { useEffect, useSyncExternalStore } from 'react';

import { useModal, useUser } from '@web/app/providers';
import { isStandalone } from '@web/shared/lib';

import {
  getInstallHintState,
  markInstallHintInstalled,
  recordInstallHintSession,
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

  useEffect(() => {
    if (isStandalone()) markInstallHintInstalled();
    else recordInstallHintSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !shouldShowInstallHint(state)) return;
    if (getOpenedModals().length) return;

    recordInstallHintShown();
    openModal('INSTALL_HINT');
  }, [isAuthenticated, state, openModal, getOpenedModals]);
};
