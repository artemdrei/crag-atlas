import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export const adminFeedbackDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'DELETE_FEEDBACK',
    Component: lazy(() => import('./desktop/DeleteFeedbackDialog'))
  }
];

export const adminFeedbackMobileRegistrations: ModalRegistration[] = [
  {
    id: 'DELETE_FEEDBACK',
    Component: lazy(() => import('./mobile/DeleteFeedbackSheet'))
  }
];
