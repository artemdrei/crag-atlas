import type { VideoPreview } from '@crag-atlas/api';

import type { MediaLink } from '@web/shared/lib';

import { apiGet } from './httpClient';
import { QUERY_KEYS } from './queryKeys';
import { useApiQuery } from './useApiQuery';

export const videoPreviewQuery = (link: MediaLink) => ({
  queryKey: QUERY_KEYS.videoPreview(link.id),
  queryFn: () =>
    apiGet<VideoPreview>(`/videos/preview?url=${encodeURIComponent(link.url)}`)
});

export const useApiGetVideoPreview = (link: MediaLink | undefined) => {
  const { data, isLoading, failure } = useApiQuery({
    ...videoPreviewQuery(link ?? { id: '', url: '' }),
    enabled: !!link
  });

  return { preview: data, isLoading, failure };
};
