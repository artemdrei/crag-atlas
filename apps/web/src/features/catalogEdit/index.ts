import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { ArchiveAction, ContentScope } from './common/hooks';
export {
  useApiArchiveAction,
  useApiGetClimberContent
} from './common/hooks';
export { isErasable } from './common/lib';
export {
  ArchivedItemPanel,
  ArchivedRegionPanel,
  ArchivedSectorPanel,
  ArchiveRegionButton,
  ArchiveSectorButton,
  CatalogEditActions,
  ClimberContentNote,
  EditToggleButton,
  RegionCreateForm,
  RegionEditForm,
  SectorCreateForm,
  SectorEditForm
} from './common/ui';
export { RegionPhotoPicker } from './desktop/ui/RegionPhotoPicker';

export const catalogEditDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'PURGE_CATALOG_ITEM',
    Component: lazy(() => import('./desktop/PurgeDialog'))
  },
  {
    id: 'ARCHIVE_REGION',
    Component: lazy(() => import('./desktop/ArchiveRegionDialog'))
  },
  {
    id: 'ARCHIVE_SECTOR',
    Component: lazy(() => import('./desktop/ArchiveSectorDialog'))
  }
];
