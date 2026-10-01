import {
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { track } from '@crag-atlas/analytics';

import { sleep } from '@web/shared/lib';

import { ModalContext } from './ModalContext';
import type {
  CloseModalOptions,
  ID_MODAL,
  ModalAnchor,
  ModalContextValue,
  ModalOptions,
  ModalPayloadMap,
  ModalRegistration
} from './types';

const OPEN_DELAY_MS = 10;
const CLOSE_ANIMATION_MS = 200;

interface OpenedModal {
  id: ID_MODAL;
  // Mount and open are two steps: mounting already open plays no animation.
  isOpen: boolean;
  anchor?: ModalAnchor;
}

export interface Props {
  registrations: ModalRegistration[];
  children: ReactNode;
}

export const ModalProvider = ({ registrations, children }: Props) => {
  const [opened, setOpened] = useState<OpenedModal[]>([]);
  const [payloads, setPayloads] = useState<
    Partial<{ [K in ID_MODAL]: ModalPayloadMap[K] }>
  >({});

  const registry = useMemo(() => {
    const map = new Map<ID_MODAL, ModalRegistration>();
    for (const reg of registrations) map.set(reg.id, reg);
    return map;
  }, [registrations]);

  // openModal is a no-op for a surface already up, so the same ids gate the
  // reporting.
  const reportedRef = useRef<Set<ID_MODAL>>(new Set());

  const openModal = useCallback<ModalContextValue['openModal']>(
    async (idModal, ...args) => {
      const [data, options] = args as [unknown?, ModalOptions?];
      const rect = options?.anchorEl?.getBoundingClientRect();
      const dialog = registry.get(idModal)?.dialog;

      if (dialog && !reportedRef.current.has(idModal)) {
        reportedRef.current.add(idModal);
        track({ name: 'Dialog Opened', props: { dialog } });
      }

      setOpened((prev) =>
        prev.some(({ id }) => id === idModal)
          ? prev
          : [
              ...prev,
              {
                id: idModal,
                isOpen: false,
                anchor: rect && { top: rect.bottom, left: rect.right }
              }
            ]
      );

      if (data !== undefined) {
        setPayloads((prev) => ({ ...prev, [idModal]: data }));
      }

      await sleep(OPEN_DELAY_MS);
      setOpened((prev) =>
        prev.map((modal) =>
          modal.id === idModal ? { ...modal, isOpen: true } : modal
        )
      );
    },
    [registry]
  );

  const closeModal = useCallback(
    async (idModal: ID_MODAL, options?: CloseModalOptions) => {
      const dialog = registry.get(idModal)?.dialog;

      if (
        dialog &&
        reportedRef.current.delete(idModal) &&
        !options?.isCompleted
      ) {
        track({ name: 'Dialog Dismissed', props: { dialog } });
      }

      setOpened((prev) =>
        prev.map((modal) =>
          modal.id === idModal ? { ...modal, isOpen: false } : modal
        )
      );

      await sleep(CLOSE_ANIMATION_MS);
      setOpened((prev) => prev.filter(({ id }) => id !== idModal));
      setPayloads((prev) => {
        const next = { ...prev };
        delete next[idModal];
        return next;
      });
    },
    [registry]
  );

  // Read through a ref so the context value never changes: every `useModal`
  // consumer would re-render otherwise.
  const openedRef = useRef<ID_MODAL[]>([]);
  useEffect(() => {
    openedRef.current = opened.map(({ id }) => id);
  }, [opened]);

  const getOpenedModals = useCallback(() => openedRef.current, []);

  const value = useMemo(
    () => ({ openModal, closeModal, getOpenedModals }),
    [openModal, closeModal, getOpenedModals]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}

      {opened.map(({ id, isOpen, anchor }) => {
        const reg = registry.get(id);
        if (!reg) return null;

        const { Component } = reg;
        const payload = (payloads[id] ?? {}) as Record<string, unknown>;

        return (
          <Suspense key={id} fallback={null}>
            <Component open={isOpen} anchor={anchor} {...payload} />
          </Suspense>
        );
      })}
    </ModalContext.Provider>
  );
};
