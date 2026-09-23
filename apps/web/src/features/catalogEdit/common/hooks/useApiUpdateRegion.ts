import type { Region, UpdateRegion } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idRegion: string;
  onSaved?: () => void;
}

export const useApiUpdateRegion = ({ idRegion, onSaved }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: UpdateRegion) =>
      apiPatch<Region>(`/regions/${idRegion}`, payload),
    onSuccess: (region) => {
      queryClient.setQueryData(QUERY_KEYS.region(idRegion), region);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.regionList(false)
      });
      onSaved?.();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, updateRegion: mutate };
};
