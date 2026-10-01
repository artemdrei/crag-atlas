import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';

import { SignInPromptBody } from '../common';

export interface Props {
  open: boolean;
}

const SignInPromptDialog = ({ open }: Props) => {
  const { closeModal } = useModal();

  const dismiss = () => closeModal('SIGN_IN_PROMPT');

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={dismiss}>
      <DialogTitle>
        <Trans>Sign in to log this ascent</Trans>
      </DialogTitle>
      <DialogContent>
        <SignInPromptBody onSignIn={dismiss} />
      </DialogContent>
    </Dialog>
  );
};

export default SignInPromptDialog;
