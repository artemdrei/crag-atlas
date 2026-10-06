import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { qrUrlOf, useApiResolveQrPath, useApiSectorQrs } from './common';
export { CreateQrButton } from './desktop/CreateQrButton';
export { QrCodeImage } from './desktop/QrCodeImage';
export { QrSlugEditor } from './desktop/QrSlugEditor';
export { QrWarnings } from './desktop/QrWarnings';
export { SectorQrPanel } from './desktop/SectorQrPanel';
export { useDownloadQrPlaques } from './desktop/useDownloadQrPlaques';

export const sectorQrDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'CONFIRM_QR_SLUG',
    Component: lazy(() => import('./desktop/ConfirmQrSlugDialog'))
  }
];
