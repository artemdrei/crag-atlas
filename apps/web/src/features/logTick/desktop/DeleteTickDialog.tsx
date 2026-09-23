import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { DeleteTickActions, useRemoveTick } from '../common';

export interface Props {
  open: boolean;
  idTick: string;
}

const DeleteTickDialog = ({ open, idTick }: Props) => {
  const { isPending, close, deleteTick } = useRemoveTick(idTick);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Delete ascent</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans>This cannot be undone.</Trans>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <DeleteTickActions
          isPending={isPending}
          onConfirm={() => deleteTick()}
          onCancel={close}
        />
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTickDialog;
