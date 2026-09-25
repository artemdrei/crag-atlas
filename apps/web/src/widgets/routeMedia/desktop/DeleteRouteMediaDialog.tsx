import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { DeleteRouteMediaActions, useRemoveRouteMedia } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idMedia: string;
}

const DeleteRouteMediaDialog = ({ open, idRoute, idMedia }: Props) => {
  const { isPending, close, deleteMedia } = useRemoveRouteMedia({
    idRoute,
    idMedia
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Delete media</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans>This cannot be undone.</Trans>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <DeleteRouteMediaActions
          isPending={isPending}
          onConfirm={() => deleteMedia()}
          onCancel={close}
        />
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRouteMediaDialog;
