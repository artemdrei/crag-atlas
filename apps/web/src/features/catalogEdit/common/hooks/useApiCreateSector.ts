import type { CreateSector, Sector } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idRegion: string;
  onCreated?: (sector: Sector) => void;
}

export const useApiCreateSector = ({ idRegion, onCreated }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: CreateSector) =>
      apiPost<Sector>(`/regions/${idRegion}/sectors`, payload),
    onSuccess: (sector) => {
      queryClient.setQueryData(QUERY_KEYS.sector(sector.id), sector);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sectors(idRegion) });
      onCreated?.(sector);
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createSector: mutate };
};
