import type { ReplacedTopo } from './desktop/UploadPhotoDialog';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    UPLOAD_PHOTO:
      | {
          target: { kind: 'topo'; idSector: string };
          files: File[];
          replacing?: ReplacedTopo;
        }
      | {
          target: {
            kind: 'region';
            idRegion: string;
            photoUrl?: string | null;
          };
          file: File;
        };
  }
}
