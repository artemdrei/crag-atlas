import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@web/shared/api';

import { deleteOfflineRegion } from '../lib';

export const useDeleteOfflineRegion = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: deleteOfflineRegion,
    networkMode: 'always',
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offlineRegions() })
  });

  return { isDeleting: isPending, deleteRegion: mutateAsync };
};
