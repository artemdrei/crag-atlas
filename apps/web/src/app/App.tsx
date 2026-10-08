import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';
import { OfflineDownloadProvider } from '@web/features/offlineRegions';

import { OfflineRegionsSync } from './ui/OfflineRegionsSync';
import { PageViewTracker } from './ui/PageViewTracker';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

export const App = () => (
  <AppProviders>
    <OfflineDownloadProvider>
      <PageViewTracker />
      <OfflineRegionsSync />
      {isMobile ? <AppMobile /> : <AppDesktop />}
    </OfflineDownloadProvider>
  </AppProviders>
);
