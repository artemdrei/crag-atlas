import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

// Kept apart from the page barrel: App.tsx is not code-split, so importing the
// pages from there would pull the whole playground into the entry chunk. The
// DEV check lives here rather than at the call site — in a production build it
// folds to an empty array and Rollup drops the dynamic imports with it.
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
