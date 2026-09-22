import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { RouteCommentComposer, RouteCommentItem } from './common';

export const routeCommentDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'ROUTE_COMMENT_MENU',
    Component: lazy(() => import('./desktop/RouteCommentMenu'))
  },
  {
    id: 'ROUTE_COMMENT_EDIT',
    Component: lazy(() => import('./desktop/EditRouteCommentDialog'))
  },
  {
    id: 'ROUTE_COMMENT_DELETE',
    Component: lazy(() => import('./desktop/DeleteRouteCommentDialog'))
  }
];

export const routeCommentMobileRegistrations: ModalRegistration[] = [
  {
    id: 'ROUTE_COMMENT_MENU',
    Component: lazy(() => import('./mobile/RouteCommentMenuSheet'))
  },
  {
    id: 'ROUTE_COMMENT_EDIT',
    Component: lazy(() => import('./mobile/EditRouteCommentSheet'))
  },
  {
    id: 'ROUTE_COMMENT_DELETE',
    Component: lazy(() => import('./mobile/DeleteRouteCommentSheet'))
  }
];
