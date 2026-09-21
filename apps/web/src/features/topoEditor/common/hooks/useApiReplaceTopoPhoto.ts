import type { Topo } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, QUERY_KEYS } from '@web/shared/api';

import { toPhotoForm } from './useApiUploadTopo';

export interface Params {
  idSector: string;
}

export interface ReplaceTopoPhotoArgs {
  idTopo: string;
  blob: Blob;
  width: number;
  height: number;
}

export const useApiReplaceTopoPhoto = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ idTopo, blob, width, height }: ReplaceTopoPhotoArgs) =>
      apiUpload<Topo>(
        'PUT',
        `/topos/${idTopo}/photo`,
        toPhotoForm(blob, { width, height })
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) })
  });

  return { isPending, replaceTopoPhoto: mutateAsync };
};
