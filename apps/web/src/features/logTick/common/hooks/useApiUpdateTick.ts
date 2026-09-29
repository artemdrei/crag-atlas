import type { Tick, UpdateTick } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, invalidateRouteLists, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idTick: string;
  onSaved: () => void | Promise<void>;
}

export const useApiUpdateTick = ({ idTick, onSaved }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: UpdateTick) =>
      apiPatch<Tick>(`/ticks/${idTick}`, payload),
    // Awaited: the mutation stays pending while the callback uploads the
    // media that belongs to this tick, so the form cannot be submitted twice.
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      invalidateRouteLists(queryClient);
      await onSaved();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, updateTick: mutate };
};
