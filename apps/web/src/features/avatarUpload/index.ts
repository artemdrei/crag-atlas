import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export { AvatarPickerDesktop } from './desktop/AvatarPickerDesktop';
export { AvatarPickerMobile } from './mobile/AvatarPickerMobile';

export const avatarUploadDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'CROP_AVATAR',
    Component: lazy(() => import('./desktop/CropAvatarDialog'))
  }
];

export const avatarUploadMobileRegistrations: ModalRegistration[] = [
  {
    id: 'CROP_AVATAR',
    Component: lazy(() => import('./mobile/CropAvatarSheet'))
  }
];
