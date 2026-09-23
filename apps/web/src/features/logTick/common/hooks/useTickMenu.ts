import { useModal } from '@web/app/providers';

import type { Tick } from '../entities';

export const useTickMenu = (tick: Tick) => {
  const { openModal, closeModal } = useModal();

  const close = () => closeModal('TICK_MENU');

  return {
    close,
    edit: () => {
      openModal('TICK_EDIT', { tick });
      close();
    },
    remove: () => {
      openModal('TICK_DELETE', { idTick: tick.id });
      close();
    }
  };
};
