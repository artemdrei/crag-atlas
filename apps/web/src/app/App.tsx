import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';
import {
  logTickDesktopRegistrations,
  logTickMobileRegistrations
} from '@web/features/logTick';
import {
  playgroundDesktopRegistrations,
  playgroundMobileRegistrations
} from '@web/pages/playground';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

const desktopRegistrations = [
  ...logTickDesktopRegistrations,
  ...playgroundDesktopRegistrations
];

const mobileRegistrations = [
  ...logTickMobileRegistrations,
  ...playgroundMobileRegistrations
];

export const App = () => (
  <AppProviders
    modalRegistrations={isMobile ? mobileRegistrations : desktopRegistrations}
  >
    {isMobile ? <AppMobile /> : <AppDesktop />}
  </AppProviders>
);
