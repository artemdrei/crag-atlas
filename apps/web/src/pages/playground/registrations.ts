import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

// Apart from the page barrel: App.tsx is not code-split, so importing from
// there would pull the playground into the entry chunk. The DEV check folds to
// an empty array and Rollup drops the dynamic imports with it.
export const playgroundDesktopRegistrations: ModalRegistration[] = import.meta
  .env.DEV
  ? [
      {
        id: 'PLAYGROUND_DEMO',
        Component: lazy(() => import('./desktop/PlaygroundDemoDialog'))
      }
    ]
  : [];

export const playgroundMobileRegistrations: ModalRegistration[] = import.meta
  .env.DEV
  ? [
      {
        id: 'PLAYGROUND_DEMO',
        Component: lazy(() => import('./mobile/PlaygroundDemoSheet'))
      }
    ]
  : [];
