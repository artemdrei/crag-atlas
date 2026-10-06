import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { InstallHintTrigger, useOpenInstallHint } from './common';

export const installHintMobileRegistrations: ModalRegistration[] = [
  {
    id: 'INSTALL_HINT',
    Component: lazy(() => import('./mobile/InstallHintSheet'))
  }
];
