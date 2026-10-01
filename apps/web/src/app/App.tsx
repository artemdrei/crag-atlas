import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';

import { PageViewTracker } from './ui/PageViewTracker';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

export const App = () => (
  <AppProviders>
    <PageViewTracker />
    {isMobile ? <AppMobile /> : <AppDesktop />}
  </AppProviders>
);
