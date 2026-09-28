import type { Me } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import { useApiRemoveAvatar } from './useApiRemoveAvatar';
import { useApiReplaceAvatar } from './useApiReplaceAvatar';

export const isSupportedPhoto = (file: File): boolean =>
  file.type.startsWith('image/');

/**
 * Reporting the outcome is left to the caller: a toaster belongs to the web,
 * and this is the half a React Native screen would reuse unchanged.
 */
export const useAvatarActions = () => {
  const { data: me } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me')
  });
  const { isPending: isReplacing, replaceAvatar } = useApiReplaceAvatar();
  const { isPending: isRemoving, removeAvatar } = useApiRemoveAvatar();

  return {
    hasPhoto: !!me?.avatarUrl,
    isPending: isReplacing || isRemoving,
    pick: replaceAvatar,
    remove: removeAvatar
  };
};
