import type { ReactNode } from 'react';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    PURGE_CATALOG_ITEM: {
      name: string;
      warning?: ReactNode;
      onConfirm: () => void;
    };
    ARCHIVE_REGION: {
      regionName: string;
      sectorCount: number;
      onConfirm: () => void;
    };
    ARCHIVE_SECTOR: {
      sectorName: string;
      routeCount: number;
      onConfirm: () => void;
    };
  }
}
