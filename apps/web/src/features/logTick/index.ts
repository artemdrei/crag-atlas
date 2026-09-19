import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export const logTickDesktopRegistrations: ModalRegistration[] = [
  { id: 'LOG_TICK', Component: lazy(() => import('./desktop/LogTickDialog')) }
];

export const logTickMobileRegistrations: ModalRegistration[] = [
  { id: 'LOG_TICK', Component: lazy(() => import('./mobile/LogTickSheet')) }
];
