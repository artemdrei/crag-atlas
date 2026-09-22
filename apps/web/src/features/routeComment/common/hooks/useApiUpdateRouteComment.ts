import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPatch, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { RouteComment, UpdateRouteComment } from '../entities';

export interface Params {
  idRoute: string;
  idComment: string;
  onUpdated: () => void;
}

export const useApiUpdateRouteComment = ({
  idRoute,
  idComment,
  onUpdated
}: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: UpdateRouteComment) =>
      apiPatch<RouteComment>(
        `/routes/${idRoute}/comments/${idComment}`,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeComments(idRoute)
      });
      onUpdated();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, updateComment: mutate };
};
