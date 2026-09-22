import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { DeleteRouteCommentActions, useRemoveRouteComment } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idComment: string;
}

const DeleteRouteCommentDialog = ({ open, idRoute, idComment }: Props) => {
  const { isPending, close, deleteComment } = useRemoveRouteComment({
    idRoute,
    idComment
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Delete comment</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans>This cannot be undone.</Trans>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <DeleteRouteCommentActions
          isPending={isPending}
          onConfirm={() => deleteComment()}
          onCancel={close}
        />
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRouteCommentDialog;
