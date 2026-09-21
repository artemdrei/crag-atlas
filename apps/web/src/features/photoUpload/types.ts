import type { ReplacedTopo } from './desktop/UploadPhotoDialog';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    /**
     * A topo takes any number of photos; a region has one cover, so the single
     * file is the type rather than a slice the dialog has to remember to make.
     */
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
