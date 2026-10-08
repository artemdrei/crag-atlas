import { useRef } from 'react';

import { track } from '@crag-atlas/analytics';
import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';

import { useModal } from '@web/app/providers';
import { recordInstallHintMoment } from '@web/features/installHint';
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
      const media = mediaRef.current;

      // Here, not in the request hook: the media counts live only in the form.
      track({
        name: 'Tick Logged',
        props: {
          ascent_type: tick.ascentType,
          id_route: idRoute,
          has_note: !!tick.note,
          has_rating: !!tick.rating,
          has_partner: !!(tick.idPartner ?? tick.partnerName),
          has_grade_vote: !!tick.gradeVote,
          has_weather: !!tick.weather,
          weather_edited: !!tick.weather?.isManual,
          photo_count: media.files.length,
          video_count: media.links.length
        }
      });
      await saveTickMedia(idRoute, tick.id, mediaRef.current);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeMedia(idRoute)
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      invalidateRouteLists(queryClient);
      toast.success(t`Ascent logged`);
      // The sheet calls onClose on its way out whoever asked for it.
      closeModal('LOG_TICK', { isCompleted: true });
      recordInstallHintMoment();
    }
  });

  const save = (payload: Omit<CreateTick, 'idRoute'>, media: PendingMedia) => {
    mediaRef.current = media;
    createTick({ ...payload, idRoute });
  };

  return { isPending, dismiss, save };
};
