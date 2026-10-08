import type { FeedbackPage } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';
import {
  type InfiniteData,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { apiDelete, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  onDeleted: () => void;
}

export const useApiDeleteFeedback = ({ onDeleted }: Params) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (idFeedback: string) => apiDelete(`/feedback/${idFeedback}`),
    onSuccess: (_result, idFeedback) => {
      queryClient.setQueryData<InfiniteData<FeedbackPage>>(
        QUERY_KEYS.feedback(),
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== idFeedback)
            }))
          }
      );
      toast.success(t`Feedback deleted`);
      onDeleted();
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, deleteFeedback: mutate };
};
