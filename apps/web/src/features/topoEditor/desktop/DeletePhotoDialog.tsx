import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';

export interface Props {
  routeNames: string;
  open: boolean;
  onConfirm: () => void;
}

const DeletePhotoDialog = ({ routeNames, open, onConfirm }: Props) => {
  const { closeModal } = useModal();

  const close = () => closeModal('DELETE_TOPO_PHOTO');

  const confirm = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Trans>Delete the photo?</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans>
            This photo carries the lines of: {routeNames}. It disappears from
            the sector together with those lines, for everyone, straight away.
            The routes themselves stay in the catalog.
          </Trans>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button color="error" variant="contained" onClick={confirm}>
          <Trans>Delete photo</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePhotoDialog;
