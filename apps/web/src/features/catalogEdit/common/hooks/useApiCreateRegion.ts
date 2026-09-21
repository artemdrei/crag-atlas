import type { CreateRegion, Region } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  onCreated?: (region: Region) => void;
}

export const useApiCreateRegion = ({ onCreated }: Params = {}) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: CreateRegion) => apiPost<Region>('/regions', payload),
    onSuccess: (region) => {
      queryClient.setQueryData(QUERY_KEYS.region(region.id), region);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() });
      onCreated?.(region);
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createRegion: mutate };
};
