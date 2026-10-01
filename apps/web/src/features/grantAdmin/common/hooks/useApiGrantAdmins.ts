import type { Admin, GrantAdmin } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  onGranted: () => void;
}

export const useApiGrantAdmins = ({ onGranted }: Params) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (idUsers: string[]) =>
      apiPost<Admin[]>('/admins', { idUsers } satisfies GrantAdmin),
    onSuccess: (admins) => {
      queryClient.setQueryData(QUERY_KEYS.admins(), admins);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminCandidates()
      });
      toast.success(t`Admin access granted`);
      onGranted();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, grantAdmins: mutate };
};
