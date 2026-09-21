import type { ReplacedTopo } from './desktop/UploadPhotoDialog';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    UPLOAD_TOPO_PHOTO: {
      idSector: string;
      files: File[];
      replacing?: ReplacedTopo;
    };
    DELETE_TOPO_LINE: { routeName: string; onConfirm: () => void };
    DELETE_ROUTE: {
      routeName: string;
      isNew: boolean;
      onConfirm: () => void;
    };
  }
}
