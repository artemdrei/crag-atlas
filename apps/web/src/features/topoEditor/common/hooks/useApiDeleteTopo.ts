import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, invalidateToposAndRegions } from '@web/shared/api';

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
    onSuccess: () => invalidateToposAndRegions(queryClient, idSector)
  });

  return { isPending, deleteTopo: mutateAsync };
};
