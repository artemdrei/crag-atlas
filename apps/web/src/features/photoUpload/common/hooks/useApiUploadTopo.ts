import type { Topo } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, invalidateToposAndRegions } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export interface UploadTopoArgs {
  blob: Blob;
  width: number;
  height: number;
}

export const useApiUploadTopo = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ blob, width, height }: UploadTopoArgs) =>
      apiUpload<Topo>(
        'POST',
        `/sectors/${idSector}/topos`,
        toPhotoForm(blob, { width, height })
      ),
    onSuccess: () => invalidateToposAndRegions(queryClient, idSector)
  });

  return { isPending, uploadTopo: mutateAsync };
};

export const toPhotoForm = (
  blob: Blob,
  fields: Record<string, string | number> = {}
): FormData => {
  const form = new FormData();

  form.append('file', blob, 'photo.webp');

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }

  return form;
};
