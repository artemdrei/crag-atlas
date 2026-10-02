import type { TopoPhotoPayload } from './common';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    VIEW_TOPO_PHOTO: TopoPhotoPayload;
  }
}
