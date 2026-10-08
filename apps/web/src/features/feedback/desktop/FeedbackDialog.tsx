import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';

import { FeedbackBody } from '../common';

export interface Props {
  open: boolean;
}

const FeedbackDialog = ({ open }: Props) => {
  const { closeModal } = useModal();

  const dismiss = () => closeModal('SEND_FEEDBACK');

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={dismiss}>
      <DialogTitle>
        <Trans>Feedback</Trans>
      </DialogTitle>
      <DialogContent>
        <FeedbackBody />
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
