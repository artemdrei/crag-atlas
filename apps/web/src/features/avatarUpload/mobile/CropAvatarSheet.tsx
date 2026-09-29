import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { BottomSheet, FormActions } from '@web/shared/ui';

import { AvatarCropStage, useAvatarCrop } from '../common';

export interface Props {
  open: boolean;
  file: File;
}

const CropAvatarSheet = ({ open, file }: Props) => {
  const { t } = useLingui();
  const { close, isPending, isCropped, cropper, save } = useAvatarCrop(file);

  return (
    <BottomSheet title={t`Position your photo`} isOpen={open} onClose={close}>
      <AvatarCropStage cropper={cropper} />
      <FormActions>
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
      </FormActions>
    </BottomSheet>
  );
};

export default CropAvatarSheet;
