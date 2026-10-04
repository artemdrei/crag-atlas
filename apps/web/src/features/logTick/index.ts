import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { TickHeader } from './common';
export {
  TickActionsButton,
  toRouteSends,
  useApiGetMyRouteTicks,
  useRouteSends
} from './common';

export const logTickDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'LOG_TICK',
    Component: lazy(() => import('./desktop/LogTickDialog')),
    dialog: 'tick'
  },
  { id: 'TICK_MENU', Component: lazy(() => import('./desktop/TickMenu')) },
  {
    id: 'TICK_EDIT',
    Component: lazy(() => import('./desktop/EditTickDialog'))
  },
  {
    id: 'TICK_DELETE',
    Component: lazy(() => import('./desktop/DeleteTickDialog'))
  }
];

export const logTickMobileRegistrations: ModalRegistration[] = [
  {
    id: 'LOG_TICK',
    Component: lazy(() => import('./mobile/LogTickSheet')),
    dialog: 'tick'
  },
  { id: 'TICK_MENU', Component: lazy(() => import('./mobile/TickMenuSheet')) },
  { id: 'TICK_EDIT', Component: lazy(() => import('./mobile/EditTickSheet')) },
  {
    id: 'TICK_DELETE',
    Component: lazy(() => import('./mobile/DeleteTickSheet'))
  }
];
