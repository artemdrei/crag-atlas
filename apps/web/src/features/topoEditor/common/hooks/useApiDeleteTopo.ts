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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) })
  });

  return { isPending, deleteTopo: mutateAsync };
};
