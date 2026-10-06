import type { SectorQr } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPut, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Payload {
  idSector: string;
  slug: string;
}

export const useApiSetQrSlug = () => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ idSector, slug }: Payload) =>
      apiPut<SectorQr>(`/qr-paths/sectors/${idSector}`, { slug }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qrPaths() }),
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, setQrSlug: mutate };
};
