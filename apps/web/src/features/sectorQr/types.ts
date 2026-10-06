// `export {}` keeps this a module: without it the declaration below is an
// ambient module, and every ModalPayloadMap entry collapses to never.
export {};

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    CONFIRM_QR_SLUG: {
      oldPath: string;
      newPath: string;
      onConfirm: () => void;
    };
  }
}
