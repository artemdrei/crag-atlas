import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { CreateRouteComment, RouteComment } from '../entities';

export interface Params {
  idRoute: string;
  onCreated: () => void;
}

export const useApiCreateRouteComment = ({ idRoute, onCreated }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (payload: CreateRouteComment) =>
      apiPost<RouteComment>(`/routes/${idRoute}/comments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeComments(idRoute)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      onCreated();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createComment: mutate };
};
