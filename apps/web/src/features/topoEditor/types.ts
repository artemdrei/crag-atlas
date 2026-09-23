import type { GradeScale } from '@crag-atlas/api';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    DELETE_TOPO_LINE: { routeName: string; onConfirm: () => void };
    DELETE_TOPO_PHOTO: { routeNames: string; onConfirm: () => void };
    ARCHIVE_ROUTE: {
      routeName: string;
      grade: string;
      gradeScale: GradeScale;
      isNew: boolean;
      onConfirm: () => void;
    };
    LEAVE_EDITOR: { onConfirm: () => void };
  }
}
