import type { QrPathTarget } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export const useApiResolveQrPath = (path: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.qrPathTarget(path),
    queryFn: () =>
      apiGet<QrPathTarget>(
        `/qr-paths/resolve?${new URLSearchParams({ path })}`
      ),
    enabled: !!path
  });

  return { target: data ?? null, isLoading, failure };
};
