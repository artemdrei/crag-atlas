import { useSendFeedback } from '../hooks';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackSent } from './FeedbackSent';

export const FeedbackBody = () => {
  const { isPending, isSent, isGuest, dismiss, send } = useSendFeedback();

  if (isSent) return <FeedbackSent />;

  return (
    <FeedbackForm
      isGuest={isGuest}
      isPending={isPending}
      onSubmit={send}
      onCancel={dismiss}
    />
  );
};
