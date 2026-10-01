import type { ComponentType, LazyExoticComponent } from 'react';

import type { DialogName } from '@crag-atlas/analytics';

// biome-ignore lint/suspicious/noExplicitAny: registry holds modal components with heterogeneous props
type AnyModalComponent = ComponentType<any>;

// biome-ignore lint/suspicious/noEmptyInterface: extended by features via declaration merging
export interface ModalPayloadMap {}

export type ID_MODAL = keyof ModalPayloadMap;

export interface ModalRegistration<K extends ID_MODAL = ID_MODAL> {
  id: K;
  Component: LazyExoticComponent<AnyModalComponent> | AnyModalComponent;
  dialog?: DialogName;
}

export interface ModalAnchor {
  top: number;
  left: number;
}

export interface ModalOptions {
  anchorEl?: HTMLElement | null;
}

export interface CloseModalOptions {
  isCompleted?: boolean;
}

export interface ModalContextValue {
  openModal: <K extends ID_MODAL>(
    idModal: K,
    ...args: ModalPayloadMap[K] extends undefined
      ? [options?: ModalOptions]
      : [data: ModalPayloadMap[K], options?: ModalOptions]
  ) => void;
  closeModal: (idModal: ID_MODAL, options?: CloseModalOptions) => void;
  getOpenedModals: () => ID_MODAL[];
}
