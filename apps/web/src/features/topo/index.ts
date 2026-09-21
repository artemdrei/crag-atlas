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
  findNearestPoint,
  findNearestSegment,
  findTopoOfRoute,
  lineOpacity,
  normalizeLineDirection,
  orderRoutes,
  pointerToPhoto,
  projectOntoSegment,
  smoothPath,
  TopoImage,
  TopoPhotoViewer,
  TopoPointMark,
  TopoRouteBadge,
  TopoThumbStrip,
  TopoZoomControls,
  TopoZoomStage,
  toleranceOf,
  useApiGetTopos,
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
    Component: lazy(() => import('./mobile/TopoPhotoSheet'))
  }
];
