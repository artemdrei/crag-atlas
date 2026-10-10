import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { ConditionsPlace } from './common';
export { ConditionsButton } from './common';

export const sectorConditionsMobileRegistrations: ModalRegistration[] = [
  {
    id: 'CONDITIONS',
    Component: lazy(() => import('./mobile/ConditionsSheetMobile'))
  }
];

export const sectorConditionsDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'CONDITIONS',
    Component: lazy(() => import('./desktop/ConditionsDialogDesktop'))
  }
];
