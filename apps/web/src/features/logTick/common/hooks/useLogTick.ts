import { useRef } from 'react';

import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';

import { useModal } from '@web/app/providers';
import { invalidateRouteLists, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { CreateTick, PendingMedia } from '../entities';
import { saveTickMedia } from '../lib';
import { useApiCreateTick } from './useApiCreateTick';

export const useLogTick = (idRoute: string) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const queryClient = useQueryClient();
  const mediaRef = useRef<PendingMedia>({ links: [], files: [] });

  const dismiss = () => closeModal('LOG_TICK');

  const { isPending, createTick } = useApiCreateTick({
    onCreated: async (tick) => {
      await saveTickMedia(idRoute, tick.id, mediaRef.current);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeMedia(idRoute)
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      invalidateRouteLists(queryClient);
      toast.success(t`Ascent logged`);
      // The sheet calls onClose on its way out whoever asked for it.
      closeModal('LOG_TICK', { isCompleted: true });
    }
  });

  const save = (payload: Omit<CreateTick, 'idRoute'>, media: PendingMedia) => {
    mediaRef.current = media;
    createTick({ ...payload, idRoute });
  };

  return { isPending, dismiss, save };
};
