import { useEffect } from 'react';

import { useModal, useUser } from '@web/app/providers';

import { isInstallHintSeen, isStandalone, markInstallHintSeen } from '../lib';

export const useInstallHintTrigger = () => {
  const { openModal } = useModal();
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated || isStandalone() || isInstallHintSeen()) return;

    markInstallHintSeen();
    openModal('INSTALL_HINT');
  }, [isAuthenticated, openModal]);
};
