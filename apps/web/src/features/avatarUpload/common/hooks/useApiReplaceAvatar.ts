import type { Me } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, QUERY_KEYS } from '@web/shared/api';
import type { SourceRect } from '@web/shared/lib';
import { imageToWebp } from '@web/shared/lib';

const AVATAR_EDGE = 512;

export interface Params {
  file: File;
  crop: SourceRect;
}

export const useApiReplaceAvatar = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ file, crop }: Params) => {
      const { blob } = await imageToWebp(file, { maxEdge: AVATAR_EDGE, crop });
      const form = new FormData();

      form.append('file', blob, 'avatar.webp');

      return apiUpload<Me>('PUT', '/me/photo', form);
    },
    onSuccess: (me) => queryClient.setQueryData(QUERY_KEYS.me(), me)
  });

  return { isPending, replaceAvatar: mutateAsync };
};
