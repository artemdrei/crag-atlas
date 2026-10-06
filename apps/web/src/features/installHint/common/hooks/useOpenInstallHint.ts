import { useModal } from '@web/app/providers';

import { isStandalone } from '../lib';

export const useOpenInstallHint = () => {
  const { openModal } = useModal();

  return {
    isInstalled: isStandalone(),
    openInstallHint: () => openModal('INSTALL_HINT')
  };
};
