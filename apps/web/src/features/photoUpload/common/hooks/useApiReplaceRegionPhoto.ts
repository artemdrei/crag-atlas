import type { Region } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, QUERY_KEYS } from '@web/shared/api';

import { toPhotoForm } from './useApiUploadTopo';

export interface Params {
  idRegion: string;
}

export const useApiReplaceRegionPhoto = ({ idRegion }: Params) => {
  const queryClient = useQueryClient();

  // Already compressed: the dialog needs the WebP anyway.
  const { isPending, mutateAsync } = useMutation({
    mutationFn: (blob: Blob) =>
      apiUpload<Region>('PUT', `/regions/${idRegion}/photo`, toPhotoForm(blob)),
    onSuccess: (region) => {
      queryClient.setQueryData(QUERY_KEYS.region(idRegion), region);

      return queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.regionList(false)
      });
    }
  });

  return { isPending, replaceRegionPhoto: mutateAsync };
};
