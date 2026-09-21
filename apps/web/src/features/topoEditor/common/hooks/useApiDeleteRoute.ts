import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export const useApiDeleteRoute = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (idRoute: string) => apiDelete(`/routes/${idRoute}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routes(idSector) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) });
    }
  });

  return { isPending, deleteRoute: mutateAsync };
};
