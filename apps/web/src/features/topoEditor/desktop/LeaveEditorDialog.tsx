import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';

export interface Props {
  open: boolean;
  onConfirm: () => void;
}

const LeaveEditorDialog = ({ open, onConfirm }: Props) => {
  const { closeModal } = useModal();

  const close = () => closeModal('LEAVE_EDITOR');

  const confirm = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Trans>Leave without saving?</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans>
            The edits you have not saved yet are dropped, and the catalog keeps
            what it had.
          </Trans>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>
          <Trans>Keep editing</Trans>
        </Button>
        <Button color="error" variant="contained" onClick={confirm}>
          <Trans>Leave</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveEditorDialog;
