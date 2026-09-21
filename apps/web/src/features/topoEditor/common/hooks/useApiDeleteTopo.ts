import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export const useApiDeleteTopo = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({
      idTopo,
      isForced
    }: {
      idTopo: string;
      isForced?: boolean;
    }) => apiDelete(`/topos/${idTopo}${isForced ? '?force=true' : ''}`),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) }),
        // A sector's card shows its first photo, and that card is listed under
        // a region this hook has no id for.
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() })
      ])
  });

  return { isPending, deleteTopo: mutateAsync };
};
