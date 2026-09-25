import { useRef } from 'react';

import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';

import { useModal } from '@web/app/providers';
import { invalidateRouteLists, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { CreateTick, PendingMedia, Tick } from '../entities';
import { saveTickMedia } from '../lib';
import { useApiUpdateTick } from './useApiUpdateTick';

export const useEditTick = (tick: Tick) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const queryClient = useQueryClient();
  const mediaRef = useRef<PendingMedia>({ links: [], files: [] });

  const close = () => closeModal('TICK_EDIT');

  const { isPending, updateTick } = useApiUpdateTick({
    idTick: tick.id,
    onSaved: async () => {
      await saveTickMedia(tick.idRoute, tick.id, mediaRef.current);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeMedia(tick.idRoute)
      });
      invalidateRouteLists(queryClient);
      toast.success(t`Ascent saved`);
      close();
    }
  });

  const save = (payload: Omit<CreateTick, 'idRoute'>, media: PendingMedia) => {
    mediaRef.current = media;
    updateTick(payload);
  };

  return { isPending, close, save };
};
