declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    ROUTE_COMMENT_MENU: {
      idRoute: string;
      idComment: string;
      body: string;
      canEdit: boolean;
      canDelete: boolean;
    };
    ROUTE_COMMENT_EDIT: { idRoute: string; idComment: string; body: string };
    ROUTE_COMMENT_DELETE: { idRoute: string; idComment: string };
  }
}

export {};
