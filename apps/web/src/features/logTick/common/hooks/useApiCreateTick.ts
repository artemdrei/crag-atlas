import { track } from '@crag-atlas/analytics';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { CreateTick, Tick } from '../entities';

export interface Params {
  onCreated: (tick: Tick) => void | Promise<void>;
}

export const useApiCreateTick = ({ onCreated }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: CreateTick) => apiPost<Tick>('/ticks', payload),
    // Awaited: the mutation stays pending while the callback uploads the
    // media that belongs to this tick, so the form cannot be submitted twice.
    onSuccess: async (tick, payload) => {
      track({
        name: 'Tick Logged',
        props: {
          ascent_type: payload.ascentType,
          id_route: payload.idRoute,
          has_note: !!payload.note,
          has_rating: !!payload.rating,
          has_partner: !!(payload.idPartner ?? payload.partnerName),
          has_grade_vote: !!payload.gradeVote
        }
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      await onCreated(tick);
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createTick: mutate };
};
