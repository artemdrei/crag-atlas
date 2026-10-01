import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export const signInPromptDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'SIGN_IN_PROMPT',
    Component: lazy(() => import('./desktop/SignInPromptDialog'))
  }
];

export const signInPromptMobileRegistrations: ModalRegistration[] = [
  {
    id: 'SIGN_IN_PROMPT',
    Component: lazy(() => import('./mobile/SignInPromptSheet'))
  }
];
