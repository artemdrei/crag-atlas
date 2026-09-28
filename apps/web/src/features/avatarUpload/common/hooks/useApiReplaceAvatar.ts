import type { Me } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, QUERY_KEYS } from '@web/shared/api';
import { imageToWebp } from '@web/shared/lib';

/** A face never renders larger than the profile header, at any density. */
const AVATAR_EDGE = 512;

export const useApiReplaceAvatar = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (file: File) => {
      const { blob } = await imageToWebp(file, {
        maxEdge: AVATAR_EDGE,
        isSquare: true
      });
      const form = new FormData();

      form.append('file', blob, 'avatar.webp');

      return apiUpload<Me>('PUT', '/me/photo', form);
    },
    onSuccess: (me) => queryClient.setQueryData(QUERY_KEYS.me(), me)
  });

  return { isPending, replaceAvatar: mutateAsync };
};
