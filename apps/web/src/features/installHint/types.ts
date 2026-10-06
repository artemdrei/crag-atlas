// `export {}` keeps this a module: without it the declaration below is an
// ambient module, and every ModalPayloadMap entry collapses to never.
export {};

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    INSTALL_HINT: undefined;
  }
}
