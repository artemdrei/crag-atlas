declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    ROUTE_MEDIA_ADD: { idRoute: string };
    ROUTE_MEDIA_VIEW: { idRoute: string; idMedia?: string };
    ROUTE_MEDIA_DELETE: { idRoute: string; idMedia: string };
  }
}

export {};
