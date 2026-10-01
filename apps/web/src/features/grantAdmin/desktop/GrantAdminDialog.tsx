import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';

import { GrantAdminBody } from '../common';

export interface Props {
  open: boolean;
}

const GrantAdminDialog = ({ open }: Props) => {
  const { closeModal } = useModal();

  const dismiss = () => closeModal('GRANT_ADMIN');

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={dismiss}>
      <DialogTitle>
        <Trans>Add admin</Trans>
      </DialogTitle>
      <DialogContent>
        <GrantAdminBody onClose={dismiss} />
      </DialogContent>
    </Dialog>
  );
};

export default GrantAdminDialog;
