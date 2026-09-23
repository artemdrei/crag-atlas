import { useRef } from 'react';

import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import type { CreateTick, PendingMedia } from '../entities';
import { saveTickMedia } from '../lib';
import { useApiCreateTick } from './useApiCreateTick';

export const useLogTick = (idRoute: string) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const mediaRef = useRef<PendingMedia>({ links: [], files: [] });

  const close = () => closeModal('LOG_TICK');

  const { isPending, createTick } = useApiCreateTick({
    onCreated: async (tick) => {
      await saveTickMedia(idRoute, tick.id, mediaRef.current);
      toast.success(t`Ascent logged`);
      close();
    }
  });

  const save = (payload: Omit<CreateTick, 'idRoute'>, media: PendingMedia) => {
    mediaRef.current = media;
    createTick({ ...payload, idRoute });
  };

  return { isPending, close, save };
};
