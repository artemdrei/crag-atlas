import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { DownloadProgress, OfflineRegion } from './common';
export {
  deleteAllOfflineRegions,
  OfflineDownloadProvider,
  useDeleteOfflineRegion,
  useOfflineRegions,
  useOfflineRegionsSync
} from './common';
export { OfflineRegionsDesktop } from './desktop/OfflineRegionsDesktop';
export { OfflineShortcutsDesktop } from './desktop/OfflineShortcutsDesktop';
export { OfflineRegionsMobile } from './mobile/OfflineRegionsMobile';
export { OfflineShortcutsMobile } from './mobile/OfflineShortcutsMobile';

export const offlineRegionsDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'SAVE_REGION_OFFLINE',
    Component: lazy(() => import('./desktop/SaveRegionOfflineDialog')),
    dialog: 'save_offline'
  }
];

export const offlineRegionsMobileRegistrations: ModalRegistration[] = [
  {
    id: 'SAVE_REGION_OFFLINE',
    Component: lazy(() => import('./mobile/SaveRegionOfflineSheet')),
    dialog: 'save_offline'
  }
];
export { OfflineCtaMobile } from './mobile/OfflineCtaMobile';
