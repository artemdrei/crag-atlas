import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { AvatarCropStage, useAvatarCrop } from '../common';

export interface Props {
  open: boolean;
  file: File;
}

const CropAvatarDialog = ({ open, file }: Props) => {
  const { close, isPending, isCropped, cropper, save } = useAvatarCrop(file);

  return (
    <Dialog open={open} maxWidth="xs" fullWidth onClose={close}>
      <DialogTitle>
        <Trans>Position your photo</Trans>
      </DialogTitle>
      <DialogContent>
        <AvatarCropStage cropper={cropper} />
      </DialogContent>
      <DialogActions>
        <Button disabled={isPending} onClick={close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          variant="contained"
          disabled={isPending || !isCropped}
          startIcon={isPending ? <CircularProgress size={16} /> : undefined}
          onClick={save}
        >
          <Trans>Save</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropAvatarDialog;
