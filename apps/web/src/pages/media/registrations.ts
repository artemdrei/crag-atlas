import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export const mediaMobileRegistrations: ModalRegistration[] = [
  {
    id: 'VIDEO_MENU',
    Component: lazy(() => import('./mobile/VideoMenuSheet'))
  }
];
