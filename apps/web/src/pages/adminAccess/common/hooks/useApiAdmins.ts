import type { Admin } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

const EMPTY: Admin[] = [];

export const useApiAdmins = () => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.admins(),
    queryFn: () => apiGet<Admin[]>('/admins')
  });

  return { admins: data ?? EMPTY, isLoading, failure };
};
