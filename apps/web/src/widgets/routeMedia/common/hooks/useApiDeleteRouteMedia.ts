import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idRoute: string;
  idMedia: string;
  onDeleted: () => void;
}

export const useApiDeleteRouteMedia = ({
  idRoute,
  idMedia,
  onDeleted
}: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: () => apiDelete(`/routes/${idRoute}/media/${idMedia}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeMedia(idRoute)
      });
      // A photo can be attached to an ascent, and the erase offer counts it.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      onDeleted();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, deleteMedia: mutate };
};
