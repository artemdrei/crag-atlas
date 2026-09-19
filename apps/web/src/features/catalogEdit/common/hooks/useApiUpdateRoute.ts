import type { Route, UpdateRoute } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idRoute: string;
  idSector: string;
  onSaved: () => void;
}

export const useApiUpdateRoute = ({ idRoute, idSector, onSaved }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: UpdateRoute) =>
      apiPatch<Route>(`/routes/${idRoute}`, payload),
    onSuccess: (route) => {
      queryClient.setQueryData(QUERY_KEYS.route(idRoute), route);
      // Grade and name show in the list, and the sector's range is derived
      // from them, so the sector's queries have to go stale as well.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routes(idSector) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sector(idSector) });
      onSaved();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, updateRoute: mutate };
};
