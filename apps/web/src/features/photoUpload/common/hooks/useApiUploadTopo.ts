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
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topos(idSector) }),
        // A sector's card shows its first photo, and that card is listed under
        // a region this hook has no id for.
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regions() })
      ])
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
