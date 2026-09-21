import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';
import {
  logTickDesktopRegistrations,
  logTickMobileRegistrations
} from '@web/features/logTick';
import { photoUploadDesktopRegistrations } from '@web/features/photoUpload';
import {
  topoDesktopRegistrations,
  topoMobileRegistrations
} from '@web/features/topo';
import { topoEditorDesktopRegistrations } from '@web/features/topoEditor';
import {
  playgroundDesktopRegistrations,
  playgroundMobileRegistrations
} from '@web/pages/playground/registrations';

const AppMobile = lazy(() => import('./mobile/AppMobile'));
const AppDesktop = lazy(() => import('./desktop/AppDesktop'));

const desktopRegistrations = [
  ...logTickDesktopRegistrations,
  ...topoDesktopRegistrations,
  ...topoEditorDesktopRegistrations,
  ...photoUploadDesktopRegistrations,
  ...playgroundDesktopRegistrations
];

const mobileRegistrations = [
  ...logTickMobileRegistrations,
  ...topoMobileRegistrations,
  ...playgroundMobileRegistrations
];

export const App = () => (
  <AppProviders
    modalRegistrations={isMobile ? mobileRegistrations : desktopRegistrations}
  >
    {isMobile ? <AppMobile /> : <AppDesktop />}
  </AppProviders>
);
