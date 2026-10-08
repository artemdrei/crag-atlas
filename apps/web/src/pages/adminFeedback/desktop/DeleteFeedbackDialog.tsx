import { Trans } from '@lingui/react/macro';

import { ConfirmDialog } from '@web/shared/ui';

import { DeleteFeedbackSummary, useRemoveFeedback } from '../common';

export interface Props {
  open: boolean;
  idFeedback: string;
  rating: number;
  message: string | null;
  authorName: string | null;
}

const DeleteFeedbackDialog = ({
  open,
  idFeedback,
  rating,
  message,
  authorName
}: Props) => {
  const { close, remove } = useRemoveFeedback(idFeedback);

  return (
    <ConfirmDialog
      open={open}
      title={<Trans>Delete feedback?</Trans>}
      confirmLabel={<Trans>Delete</Trans>}
      isDestructive
      onConfirm={remove}
      onClose={close}
    >
      <DeleteFeedbackSummary
        rating={rating}
        message={message}
        authorName={authorName}
      />
    </ConfirmDialog>
  );
};

export default DeleteFeedbackDialog;
