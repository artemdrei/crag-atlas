import type { RouteLine } from '@crag-atlas/api';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    VIEW_TOPO_PHOTO: {
      photoUrl: string;
      label: string;
      lines: RouteLine[];
      numberOf?: Record<string, number>;
      colorOf?: (idRoute: string) => string | undefined;
    };
  }
}
