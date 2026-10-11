import { track } from '@crag-atlas/analytics';
import type { CreateRouteMedia, RouteMedia } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, invalidateRouteLists, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface VideoDraft {
  idRoute: string;
  url: string;
  title: string;
  isSuggested: boolean;
}

export interface Params {
  onCreated: (media: RouteMedia) => void;
}

export const useApiCreateVideo = ({ onCreated }: Params) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ idRoute, url, title }: VideoDraft) => {
      const payload: CreateRouteMedia = { kind: 'video', url, title };

      return apiPost<RouteMedia>(`/routes/${idRoute}/media`, payload);
    },
    onSuccess: (media, { isSuggested }) => {
      track({
        name: 'Content Created',
        props: {
          content_type: 'media',
          id_route: media.idRoute,
          source: 'media',
          route_pick: isSuggested ? 'suggested' : 'manual'
        }
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.videos() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.routeMedia(media.idRoute)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.climberContents()
      });
      invalidateRouteLists(queryClient);
      onCreated(media);
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createVideo: mutate };
};
