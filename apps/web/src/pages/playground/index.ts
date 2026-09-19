import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { PagePlaygroundDesktop } from './desktop/PagePlaygroundDesktop';
export { PagePlaygroundMobile } from './mobile/PagePlaygroundMobile';

export const playgroundDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'PLAYGROUND_DEMO',
    Component: lazy(() => import('./desktop/PlaygroundDemoDialog'))
  }
];

export const playgroundMobileRegistrations: ModalRegistration[] = [
  {
    id: 'PLAYGROUND_DEMO',
    Component: lazy(() => import('./mobile/PlaygroundDemoSheet'))
  }
];
