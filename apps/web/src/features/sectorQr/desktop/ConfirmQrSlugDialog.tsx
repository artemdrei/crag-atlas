import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { ConfirmDialog, SubjectStyled } from '@web/shared/ui';

export interface Props {
  oldPath: string;
  newPath: string;
  open: boolean;
  onConfirm: () => void;
}

const ConfirmQrSlugDialog = ({ oldPath, newPath, open, onConfirm }: Props) => {
  const { closeModal } = useModal();

  return (
    <ConfirmDialog
      open={open}
      title={<Trans>Change the QR address?</Trans>}
      confirmLabel={<Trans>Change the address</Trans>}
      onConfirm={onConfirm}
      onClose={() => closeModal('CONFIRM_QR_SLUG')}
    >
      <Trans>
        Plaques already printed with <SubjectStyled>/q/{oldPath}</SubjectStyled>{' '}
        keep opening this sector. New plaques carry{' '}
        <SubjectStyled>/q/{newPath}</SubjectStyled>: download and print them
        again.
      </Trans>
    </ConfirmDialog>
  );
};

export default ConfirmQrSlugDialog;
