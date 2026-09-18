import { createContext } from 'react';

import type { ID_MODAL, ModalContextValue } from './types';

export const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
  getOpenedModals: () => [] as ID_MODAL[]
});
