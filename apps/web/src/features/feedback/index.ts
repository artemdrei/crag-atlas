import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { FeedbackButton } from './common';

export const feedbackDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'SEND_FEEDBACK',
    Component: lazy(() => import('./desktop/FeedbackDialog')),
    dialog: 'feedback'
  }
];

export const feedbackMobileRegistrations: ModalRegistration[] = [
  {
    id: 'SEND_FEEDBACK',
    Component: lazy(() => import('./mobile/FeedbackSheet')),
    dialog: 'feedback'
  }
];
