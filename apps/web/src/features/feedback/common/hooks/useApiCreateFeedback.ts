import type { CreateFeedback } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation } from '@tanstack/react-query';

import { apiPost } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export interface Params {
  onSent: (payload: CreateFeedback) => void;
}

export const useApiCreateFeedback = ({ onSent }: Params) => {
  const { isPending, mutate } = useMutation({
    mutationFn: (payload: CreateFeedback) =>
      apiPost<void>('/feedback', payload),
    onSuccess: (_result, payload) => onSent(payload),
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, createFeedback: mutate };
};
