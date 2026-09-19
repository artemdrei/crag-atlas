import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';
import {
  logTickDesktopRegistrations,
  logTickMobileRegistrations
} from '@web/features/logTick';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

export const App = () => (
  <AppProviders
    modalRegistrations={
      isMobile ? logTickMobileRegistrations : logTickDesktopRegistrations
    }
  >
    {isMobile ? <AppMobile /> : <AppDesktop />}
  </AppProviders>
);
