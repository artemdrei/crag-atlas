// Without a top-level export this file would be a script, and the block below
// would replace the payload map instead of merging into it.
export {};

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    DELETE_TOPO_LINE: { routeName: string; onConfirm: () => void };
    DELETE_TOPO_PHOTO: { routeNames: string; onConfirm: () => void };
    DELETE_ROUTE: {
      routeName: string;
      isNew: boolean;
      onConfirm: () => void;
    };
    LEAVE_EDITOR: { onConfirm: () => void };
  }
}
