import type { ReorderTopos, Topo } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export const useApiReorderTopos = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (payload: ReorderTopos) =>
      apiPatch<Topo[]>(`/sectors/${idSector}/topos/order`, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) })
  });

  return { isPending, reorderTopos: mutateAsync };
};
