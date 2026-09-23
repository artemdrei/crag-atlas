import { lazy } from 'react';
import { isMobile } from 'react-device-detect';

import { AppProviders } from '@web/app/providers';
import { catalogEditDesktopRegistrations } from '@web/features/catalogEdit';
import {
  logTickDesktopRegistrations,
  logTickMobileRegistrations
} from '@web/features/logTick';
import { photoUploadDesktopRegistrations } from '@web/features/photoUpload';
import {
  routeCommentDesktopRegistrations,
  routeCommentMobileRegistrations
} from '@web/features/routeComment';
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
  ...catalogEditDesktopRegistrations,
  ...logTickDesktopRegistrations,
  ...topoDesktopRegistrations,
  ...topoEditorDesktopRegistrations,
  ...photoUploadDesktopRegistrations,
  ...routeCommentDesktopRegistrations,
  ...playgroundDesktopRegistrations
];

const mobileRegistrations = [
  ...logTickMobileRegistrations,
  ...topoMobileRegistrations,
  ...routeCommentMobileRegistrations,
  ...playgroundMobileRegistrations
];

export const App = () => (
  <AppProviders
    modalRegistrations={isMobile ? mobileRegistrations : desktopRegistrations}
  >
    {isMobile ? <AppMobile /> : <AppDesktop />}
  </AppProviders>
);
