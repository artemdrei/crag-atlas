import { Trans, useLingui } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { RouteCommentForm, useEditRouteComment } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idComment: string;
  body: string;
}

const EditRouteCommentDialog = ({ open, idRoute, idComment, body }: Props) => {
  const { t } = useLingui();
  const { isPending, close, saveComment } = useEditRouteComment({
    idRoute,
    idComment
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Edit comment</Trans>
      </DialogTitle>
      <DialogContent>
        <RouteCommentForm
          submitLabel={t`Save`}
          initialBody={body}
          isPending={isPending}
          onSubmit={saveComment}
          onCancel={close}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditRouteCommentDialog;
