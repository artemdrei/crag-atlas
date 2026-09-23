import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import type { CreateTick, PendingMedia, Tick } from '../entities';
import { saveTickMedia } from '../lib';
import { useApiUpdateTick } from './useApiUpdateTick';

export const useEditTick = (tick: Tick) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('TICK_EDIT');

  const { isPending, updateTick } = useApiUpdateTick({
    idTick: tick.id,
    onSaved: () => {
      toast.success(t`Ascent saved`);
      close();
    }
  });

  const save = async (
    payload: Omit<CreateTick, 'idRoute'>,
    media: PendingMedia
  ) => {
    await saveTickMedia(tick.idRoute, tick.id, media);
    updateTick(payload);
  };

  return { isPending, close, save };
};
