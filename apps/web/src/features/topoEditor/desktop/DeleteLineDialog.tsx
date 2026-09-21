import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';

export interface Props {
  routeName: string;
  open: boolean;
  onConfirm: () => void;
}

const DeleteLineDialog = ({ routeName, open, onConfirm }: Props) => {
  const { closeModal } = useModal();

  const close = () => closeModal('DELETE_TOPO_LINE');

  const confirm = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Trans>Delete the line?</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans>
            The line drawn for {routeName} disappears from this photo, for
            everyone, straight away. You can draw it again.
          </Trans>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button color="error" variant="contained" onClick={confirm}>
          <Trans>Delete line</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLineDialog;
