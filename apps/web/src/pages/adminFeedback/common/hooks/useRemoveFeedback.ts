import { useModal } from '@web/app/providers';

import { useApiDeleteFeedback } from './useApiDeleteFeedback';

export const useRemoveFeedback = (idFeedback: string) => {
  const { closeModal } = useModal();

  const close = () => closeModal('DELETE_FEEDBACK');

  const { isPending, deleteFeedback } = useApiDeleteFeedback({
    onDeleted: () => closeModal('DELETE_FEEDBACK', { isCompleted: true })
  });

  return { isPending, close, remove: () => deleteFeedback(idFeedback) };
};
