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
} from '@web/pages/playground/registrations';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

// The playground registrations are empty in a production build — the gate
// lives in their own module, next to the imports it has to drop.
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
