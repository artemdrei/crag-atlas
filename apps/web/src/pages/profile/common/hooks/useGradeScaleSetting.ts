import type { Me, UpdateMe } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPatch, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useGradeScaleSetting = () => {
  const queryClient = useQueryClient();

  const { data: me, isLoading } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me')
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload: UpdateMe) => apiPatch<Me>('/me', payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() })
  });

  return {
    gradeScaleRoute: me?.gradeScaleRoute ?? 'french',
    gradeScaleBoulder: me?.gradeScaleBoulder ?? 'vscale',
    isLoading,
    isPending,
    save
  };
};
