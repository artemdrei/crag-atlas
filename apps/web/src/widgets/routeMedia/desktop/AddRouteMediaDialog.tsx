import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { AddRouteMediaForm, useAddRouteMedia } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
}

const AddRouteMediaDialog = ({ open, idRoute }: Props) => {
  const { isPending, close, createMedia } = useAddRouteMedia(idRoute);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Add video or photo</Trans>
      </DialogTitle>
      <DialogContent>
        <AddRouteMediaForm
          isPending={isPending}
          onSubmit={createMedia}
          onCancel={close}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddRouteMediaDialog;
