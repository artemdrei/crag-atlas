import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';

export const useApiRemoveAvatar = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () => apiDelete('/me/photo'),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() })
  });

  return { isPending, removeAvatar: mutateAsync };
};
