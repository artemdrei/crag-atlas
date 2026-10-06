import type { SectorQr } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export const useApiCreateQrPaths = () => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (idSectors: string[]) =>
      apiPost<SectorQr[]>('/qr-paths', { idSectors }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qrPaths() }),
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createQrPaths: mutate };
};
