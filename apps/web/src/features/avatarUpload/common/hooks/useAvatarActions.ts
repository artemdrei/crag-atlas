import type { Me } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import { useApiRemoveAvatar } from './useApiRemoveAvatar';

export const isSupportedPhoto = (file: File): boolean =>
  file.type.startsWith('image/');

export const useAvatarActions = () => {
  const { data: me } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me')
  });
  const { isPending, removeAvatar } = useApiRemoveAvatar();

  return { hasPhoto: !!me?.avatarUrl, isPending, remove: removeAvatar };
};
