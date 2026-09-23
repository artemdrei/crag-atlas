import type { CreateRoute, Route } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export const useApiCreateRoute = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (payload: CreateRoute) =>
      apiPost<Route>(`/sectors/${idSector}/routes`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sector(idSector) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() });
    }
  });

  return { isPending, createRoute: mutateAsync };
};
