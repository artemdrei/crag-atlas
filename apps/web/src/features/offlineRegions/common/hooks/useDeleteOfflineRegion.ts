import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@web/shared/api';

import { deleteOfflineRegion, trackOfflineAction } from '../lib';

export const useDeleteOfflineRegion = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: deleteOfflineRegion,
    networkMode: 'always',
    onSuccess: (_result, idRegion) =>
      trackOfflineAction({
        action: 'removed',
        id_region: idRegion,
        source: 'profile'
      }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offlineRegions() })
  });

  return { isDeleting: isPending, deleteRegion: mutateAsync };
};
