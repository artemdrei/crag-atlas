import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export const useApiDeleteRouteLine = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ idRoute, idTopo }: { idRoute: string; idTopo: string }) =>
      apiDelete(`/routes/${idRoute}/topos/${idTopo}/line`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) })
  });

  return { isPending, deleteRouteLine: mutateAsync };
};
