import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { TopoEditorSessionApi } from './common';
export {
  dirtyRouteIds,
  hasUnsavedChanges,
  useTopoEditorSession
} from './common';
export type { TopoEditorActions } from './desktop/hooks';
export { useTopoEditorActions } from './desktop/hooks';
export { TopoEditorDesktop } from './desktop/TopoEditorDesktop';

export const topoEditorDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'UPLOAD_TOPO_PHOTO',
    Component: lazy(() => import('./desktop/UploadPhotoDialog'))
  },
  {
    id: 'DELETE_TOPO_LINE',
    Component: lazy(() => import('./desktop/DeleteLineDialog'))
  },
  {
    id: 'DELETE_ROUTE',
    Component: lazy(() => import('./desktop/DeleteRouteDialog'))
  }
];
