import type { Region } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, QUERY_KEYS } from '@web/shared/api';
import { imageToWebp, toast } from '@web/shared/lib';

export interface Params {
  idRegion: string;
}

export const useApiReplaceRegionPhoto = ({ idRegion }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    // Compressed here rather than on the way out of the API: a phone shot is
    // megabytes the upload would carry for nothing, and the API takes WebP only.
    mutationFn: async (file: File) => {
      const { blob } = await imageToWebp(file);
      const form = new FormData();

      form.append('file', blob, 'region.webp');

      return apiUpload<Region>('PUT', `/regions/${idRegion}/photo`, form);
    },
    onSuccess: (region) => {
      queryClient.setQueryData(QUERY_KEYS.region(idRegion), region);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() });
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, replaceRegionPhoto: mutate };
};
