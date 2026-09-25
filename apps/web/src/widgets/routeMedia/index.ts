import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { RouteMedia } from './common';

export const routeMediaDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'ROUTE_MEDIA_DELETE',
    Component: lazy(() => import('./desktop/DeleteRouteMediaDialog'))
  }
];

export const routeMediaMobileRegistrations: ModalRegistration[] = [
  {
    id: 'ROUTE_MEDIA_DELETE',
    Component: lazy(() => import('./mobile/DeleteRouteMediaSheet'))
  }
];
