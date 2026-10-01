import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export const grantAdminDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'GRANT_ADMIN',
    Component: lazy(() => import('./desktop/GrantAdminDialog'))
  }
];

export const grantAdminMobileRegistrations: ModalRegistration[] = [
  {
    id: 'GRANT_ADMIN',
    Component: lazy(() => import('./mobile/GrantAdminSheet'))
  }
];
