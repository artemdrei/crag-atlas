import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { CreateTick, Tick } from '../entities';

export interface Params {
  onCreated: (tick: Tick) => void;
}

export const useApiCreateTick = ({ onCreated }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: CreateTick) => apiPost<Tick>('/ticks', payload),
    onSuccess: (tick) => {
      // The logbook is another slice's query; its key lives in shared/api so
      // both sides can name the same cache entry.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      onCreated(tick);
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createTick: mutate };
};
