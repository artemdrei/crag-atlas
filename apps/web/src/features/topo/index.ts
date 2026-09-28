import { lazy } from 'react';

import type { ModalRegistration } from '@web/app/providers';

import './types';

export type {
  HittableLine,
  OrderableTopo,
  Point,
  SegmentHit,
  TopoGalleryProps,
  TopoMarkKind
} from './common';
export {
  findNearestLine,
  findNearestSegment,
  findTopoOfRoute,
  lineOpacity,
  normalizeLineDirection,
  orderRoutes,
  pointerToPhoto,
  smoothPath,
  sortByNumber,
  TopoImage,
  TopoPhotoViewer,
  TopoPointMark,
  TopoRouteBadge,
  TopoZoomControls,
  TopoZoomStage,
  toleranceOf,
  useApiGetTopos,
  usePhotoLabel,
  useRouteTopo,
  useTopoGallery
} from './common';
export { TopoGalleryDesktop } from './desktop/TopoGalleryDesktop';
export { TopoGalleryMobile } from './mobile/TopoGalleryMobile';

export const topoDesktopRegistrations: ModalRegistration[] = [
  {
    id: 'VIEW_TOPO_PHOTO',
    Component: lazy(() => import('./desktop/TopoPhotoDialog'))
  }
];

export const topoMobileRegistrations: ModalRegistration[] = [
  {
    id: 'VIEW_TOPO_PHOTO',
    Component: lazy(() => import('./mobile/TopoPhotoModal'))
  }
];
