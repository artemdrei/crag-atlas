import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { RouteMedia, RouteMediaButton, useRouteMediaCount } from './common';

export const routeMediaDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'ROUTE_MEDIA_ADD',
    Component: lazy(() => import('./desktop/AddRouteMediaDialog'))
  },
  {
    id: 'ROUTE_MEDIA_VIEW',
    Component: lazy(() => import('./desktop/ViewRouteMediaDialog'))
  },
  {
    id: 'ROUTE_MEDIA_DELETE',
    Component: lazy(() => import('./desktop/DeleteRouteMediaDialog'))
  }
];

export const routeMediaMobileRegistrations: ModalRegistration[] = [
  {
    id: 'ROUTE_MEDIA_ADD',
    Component: lazy(() => import('./mobile/AddRouteMediaSheet'))
  },
  {
    id: 'ROUTE_MEDIA_VIEW',
    Component: lazy(() => import('./mobile/ViewRouteMediaModal'))
  },
  {
    id: 'ROUTE_MEDIA_DELETE',
    Component: lazy(() => import('./mobile/DeleteRouteMediaSheet'))
  }
];
