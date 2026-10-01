import { track } from '@crag-atlas/analytics';
import type { CreateRouteMedia, RouteMedia } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  apiPost,
  apiUpload,
  invalidateRouteLists,
  QUERY_KEYS
} from '@web/shared/api';
import { imageToWebp, toast } from '@web/shared/lib';

import type { RouteMediaDraft } from '../entities';

export interface Params {
  idRoute: string;
  onCreated: () => void;
}

export const useApiCreateRouteMedia = ({ idRoute, onCreated }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async (draft: RouteMediaDraft) => {
      if (draft.kind === 'video') {
        const payload: CreateRouteMedia = { kind: 'video', url: draft.url };

        await apiPost<RouteMedia>(`/routes/${idRoute}/media`, payload);

        return;
      }

      const { blob } = await imageToWebp(draft.file);
      const body = new FormData();

      body.append('file', blob, 'photo.webp');

      await apiUpload<RouteMedia>(
        'POST',
        `/routes/${idRoute}/media/photo`,
        body
      );
    },
    onSuccess: () => {
      track({
        name: 'Content Created',
        props: { content_type: 'media', id_route: idRoute }
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeMedia(idRoute)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      invalidateRouteLists(queryClient);
      onCreated();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createMedia: mutate };
};
