import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export const addVideoDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'VIDEO_ADD',
    Component: lazy(() => import('./desktop/AddVideoDialog'))
  }
];

export const addVideoMobileRegistrations: ModalRegistration[] = [
  {
    id: 'VIDEO_ADD',
    Component: lazy(() => import('./mobile/AddVideoSheet'))
  }
];
