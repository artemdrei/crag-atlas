import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { TopoEditorActions, TopoEditorSessionApi } from './common';
export {
  dirtyRouteIds,
  hasUnsavedChanges,
  isRouteDirty,
  useTopoEditorActions,
  useTopoEditorSession
} from './common';
export { TopoEditorDesktop } from './desktop/TopoEditorDesktop';
export { TopoEditorRouteDesktop } from './desktop/TopoEditorRouteDesktop';

export const topoEditorDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'DELETE_TOPO_LINE',
    Component: lazy(() => import('./desktop/DeleteLineDialog'))
  },
  {
    id: 'DELETE_TOPO_PHOTO',
    Component: lazy(() => import('./desktop/DeletePhotoDialog'))
  },
  {
    id: 'ARCHIVE_ROUTE',
    Component: lazy(() => import('./desktop/ArchiveRouteDialog'))
  },
  {
    id: 'LEAVE_EDITOR',
    Component: lazy(() => import('./desktop/LeaveEditorDialog'))
  }
];
