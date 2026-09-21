import type { Topo } from '@crag-atlas/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiUpload, QUERY_KEYS } from '@web/shared/api';

export interface Params {
  idSector: string;
}

export interface UploadTopoArgs {
  blob: Blob;
  label: string;
  width: number;
  height: number;
}

export const useApiUploadTopo = ({ idSector }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ blob, label, width, height }: UploadTopoArgs) =>
      apiUpload<Topo>(
        'POST',
        `/sectors/${idSector}/topos`,
        toPhotoForm(blob, { label, width, height })
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) })
  });

  return { isPending, uploadTopo: mutateAsync };
};

export const toPhotoForm = (
  blob: Blob,
  fields: Record<string, string | number>
): FormData => {
  const form = new FormData();

  form.append('file', blob, 'topo.webp');

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }

  return form;
};
