import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';

import { useSignInLink } from '@web/app/router/useSignInLink';
import { SignInBenefits } from '@web/shared/ui';

export interface Props {
  onSignIn: () => void;
}

export const SignInPromptBody = ({ onSignIn }: Props) => {
  const { to, from } = useSignInLink();

  return (
    <BenefitsStyled
      to={to}
      from={from}
      message={
        <Trans>
          An account keeps your logbook, your beta and your photos in one place.
        </Trans>
      }
      onSignIn={onSignIn}
    />
  );
};

// The dialog is already a surface; a framed card inside it is a box in a box.
const BenefitsStyled = styled(SignInBenefits)`
  max-width: none;
  padding: 0;
  border: none;
  background-color: transparent;
`;
