import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { SignInPromptBody } from '../common';

export interface Props {
  open: boolean;
}

const SignInPromptSheet = ({ open }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const dismiss = () => closeModal('SIGN_IN_PROMPT');

  return (
    <BottomSheet
      title={t`Sign in to log this ascent`}
      isOpen={open}
      onClose={dismiss}
    >
      <SignInPromptBody onSignIn={dismiss} />
    </BottomSheet>
  );
};

export default SignInPromptSheet;
