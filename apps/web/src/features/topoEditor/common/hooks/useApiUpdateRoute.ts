import type { Route, UpdateRoute } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, QUERY_KEYS } from '@web/shared/api';

export interface UpdateRouteArgs {
  idRoute: string;
  payload: UpdateRoute;
}

export const useApiUpdateRoute = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ idRoute, payload }: UpdateRouteArgs) =>
      apiPatch<Route>(`/routes/${idRoute}`, payload),
    onSuccess: (route) => {
      queryClient.setQueryData(QUERY_KEYS.route(route.id), route);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routes(route.idSector)
      });
    }
  });

  return { isPending, updateRoute: mutateAsync };
};
