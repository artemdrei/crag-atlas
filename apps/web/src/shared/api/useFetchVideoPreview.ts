import { useQueryClient } from '@tanstack/react-query';

import type { MediaLink } from '@web/shared/lib';

import { videoPreviewQuery } from './useApiGetVideoPreview';

export const useFetchVideoPreview = () => {
  const queryClient = useQueryClient();

  return (link: MediaLink) => queryClient.fetchQuery(videoPreviewQuery(link));
};
