import type { RouteLine, SaveRouteLine } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPut, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export interface SaveRouteLineArgs {
  idRoute: string;
  idTopo: string;
  payload: SaveRouteLine;
}

export const useApiSaveRouteLine = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ idRoute, idTopo, payload }: SaveRouteLineArgs) =>
      apiPut<RouteLine>(`/routes/${idRoute}/topos/${idTopo}/line`, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) })
  });

  return { isPending, saveRouteLine: mutateAsync };
};
