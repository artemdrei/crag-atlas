import type { ComponentType, LazyExoticComponent } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: registry holds modal components with heterogeneous props
type AnyModalComponent = ComponentType<any>;

// No modals exist yet. When a feature adds one, extend this via
// declaration merging in that feature's own types file:
//   declare module '@web/app/providers/modalProvider/types' {
//     interface ModalPayloadMap {
//       CREATE_ROUTE: { idSector: string };
//     }
//   }
// biome-ignore lint/suspicious/noEmptyInterface: extended by features via declaration merging
export interface ModalPayloadMap {}

export type ID_MODAL = keyof ModalPayloadMap;

export interface ModalRegistration<K extends ID_MODAL = ID_MODAL> {
  id: K;
  Component: LazyExoticComponent<AnyModalComponent> | AnyModalComponent;
}

/** Where a menu-shaped modal drops from; surfaces that fill the screen ignore it. */
export interface ModalAnchor {
  top: number;
  left: number;
}

export interface ModalOptions {
  /** The element the modal belongs to; the provider measures it. */
  anchorEl?: HTMLElement | null;
}

export interface ModalContextValue {
  openModal: <K extends ID_MODAL>(
    idModal: K,
    ...args: ModalPayloadMap[K] extends undefined
      ? [options?: ModalOptions]
      : [data: ModalPayloadMap[K], options?: ModalOptions]
  ) => void;
  closeModal: (idModal: ID_MODAL) => void;
  getOpenedModals: () => ID_MODAL[];
}
