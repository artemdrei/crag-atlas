import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

export const App = () => (
  <AppProviders>{isMobile ? <AppMobile /> : <AppDesktop />}</AppProviders>
);
