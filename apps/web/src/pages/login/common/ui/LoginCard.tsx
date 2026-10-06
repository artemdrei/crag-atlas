import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import { Wordmark } from '@web/shared/ui';

import { useGoogleLogin } from '../hooks';
import { EmailOtpForm } from './EmailOtpForm';
import { GoogleIcon } from './GoogleIcon';

export interface Props {
  redirectPath: string;
  onVerified: () => void;
}

export const LoginCard = ({ redirectPath, onVerified }: Props) => {
  const { isPending, signInWithGoogle } = useGoogleLogin({ redirectPath });

  return (
    <CardStyled elevation={0}>
      <LogoStyled variant="h4" />

      <GoogleButtonStyled
        fullWidth
        size="large"
        startIcon={<GoogleIcon />}
        type="button"
        variant="outlined"
        disabled={isPending}
        onClick={signInWithGoogle}
      >
        <Trans>Continue with Google</Trans>
      </GoogleButtonStyled>

      <DividerStyled>
        <Trans>or</Trans>
      </DividerStyled>

      <EmailOtpForm onVerified={onVerified} />
    </CardStyled>
  );
};

const CardStyled = styled(Paper)`
  width: 100%;
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const LogoStyled = styled(Wordmark)`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const GoogleButtonStyled = styled(Button)`
  height: 48px;
`;

const DividerStyled = styled(Divider)`
  margin: ${({ theme }) => theme.spacing(2, 0)};
  color: ${({ theme }) => theme.palette.text.secondary};
`;
