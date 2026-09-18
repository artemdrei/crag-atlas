import { type ReactNode, Suspense, useMemo, useState } from 'react';

import { sleep } from '@web/shared/lib';

import { ModalContext } from './ModalContext';
import type {
  ID_MODAL,
  ModalContextValue,
  ModalPayloadMap,
  ModalRegistration
} from './types';

const OPEN_DELAY_MS = 10;
const CLOSE_ANIMATION_MS = 200;

export interface Props {
  registrations: ModalRegistration[];
  children: ReactNode;
}

export const ModalProvider = ({ registrations, children }: Props) => {
  const [openedModals, setOpenedModals] = useState<ID_MODAL[]>([]);
  const [payloads, setPayloads] = useState<
    Partial<{ [K in ID_MODAL]: ModalPayloadMap[K] }>
  >({});
  const [open, setOpen] = useState(true);

  const registry = useMemo(() => {
    const map = new Map<ID_MODAL, ModalRegistration>();
    for (const reg of registrations) map.set(reg.id, reg);
    return map;
  }, [registrations]);

  const openModal: ModalContextValue['openModal'] = async (
    idModal,
    ...args
  ) => {
    if (openedModals.includes(idModal)) return;

    const data = args[0];
    setOpenedModals([...openedModals, idModal]);

    if (data !== undefined) {
      setPayloads((prev) => ({ ...prev, [idModal]: data }));
    }

    await sleep(OPEN_DELAY_MS);
    setOpen(true);
  };

  const closeModal = async (idModal: ID_MODAL) => {
    setOpen(false);

    await sleep(CLOSE_ANIMATION_MS);
    setOpenedModals((prev) => prev.filter((id) => id !== idModal));
    setPayloads((prev) => {
      const next = { ...prev };
      delete next[idModal];
      return next;
    });
  };

  const getOpenedModals = () => openedModals;

  return (
    <ModalContext.Provider value={{ openModal, closeModal, getOpenedModals }}>
      {children}

      {openedModals.map((idModal) => {
        const reg = registry.get(idModal);
        if (!reg) return null;

        const { Component } = reg;
        const payload = (payloads[idModal] ?? {}) as Record<string, unknown>;

        return (
          <Suspense key={idModal} fallback={null}>
            <Component open={open} {...payload} />
          </Suspense>
        );
      })}
    </ModalContext.Provider>
  );
};
