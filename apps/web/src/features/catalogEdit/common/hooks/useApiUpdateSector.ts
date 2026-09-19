import type { Sector, UpdateSector } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idSector: string;
  idRegion: string;
  onSaved: () => void;
}

export const useApiUpdateSector = ({ idSector, idRegion, onSaved }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: UpdateSector) =>
      apiPatch<Sector>(`/sectors/${idSector}`, payload),
    onSuccess: (sector) => {
      queryClient.setQueryData(QUERY_KEYS.sector(idSector), sector);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sectors(idRegion) });
      onSaved();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, updateSector: mutate };
};
