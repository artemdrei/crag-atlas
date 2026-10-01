import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export const useApiRevokeAdmin = () => {
  const queryClient = useQueryClient();

  const { isPending, mutate, variables } = useMutation({
    mutationFn: (idUser: string) => apiDelete(`/admins/${idUser}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admins() }),
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return {
    revokeAdmin: mutate,
    idRevoking: isPending ? (variables ?? null) : null
  };
};
