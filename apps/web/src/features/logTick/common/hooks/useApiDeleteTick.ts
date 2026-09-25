import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idTick: string;
  onDeleted: () => void;
}

export const useApiDeleteTick = ({ idTick, onDeleted }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: () => apiDelete(`/ticks/${idTick}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      onDeleted();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, deleteTick: mutate };
};
