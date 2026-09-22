import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  idRoute: string;
  idComment: string;
  onDeleted: () => void;
}

export const useApiDeleteRouteComment = ({
  idRoute,
  idComment,
  onDeleted
}: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: () => apiDelete(`/routes/${idRoute}/comments/${idComment}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeComments(idRoute)
      });
      onDeleted();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, deleteComment: mutate };
};
