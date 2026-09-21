import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type { ReplacedTopo } from './desktop/UploadPhotoDialog';

export const photoUploadDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'UPLOAD_PHOTO',
    Component: lazy(() => import('./desktop/UploadPhotoDialog'))
  }
];
