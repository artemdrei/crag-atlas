export {};

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    PURGE_CATALOG_ITEM: {
      name: string;
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
