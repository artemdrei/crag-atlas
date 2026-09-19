import { type SubmitEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useEmailOtpLogin } from '../hooks';

export interface Props {
  onVerified: () => void;
}

export const EmailOtpForm = ({ onVerified }: Props) => {
  const { t } = useLingui();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const {
    step,
    isSending,
    isVerifying,
    sendCode,
    verifyCode,
    resetToEmailStep
  } = useEmailOtpLogin({ onVerified });

  const handleSendCode = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) return;

    sendCode(email.trim());
  };

  const handleVerifyCode = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!code.trim()) return;

    verifyCode(email.trim(), code.trim());
  };

  const handleBackToEmail = () => {
    setCode('');
    resetToEmailStep();
  };

  if (step === 'code') {
    return (
      <FormStyled onSubmit={handleVerifyCode}>
        <HintStyled variant="body2">
          <Trans>
            We sent a code to <b>{email.trim()}</b>
          </Trans>
        </HintStyled>

        <TextField
          autoFocus
          fullWidth
          value={code}
          placeholder={t`Enter code`}
          autoComplete="one-time-code"
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          onChange={(event) => setCode(event.target.value)}
        />

        <SubmitButtonStyled
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={isVerifying}
        >
          {isVerifying ? <Trans>Verifying…</Trans> : <Trans>Continue</Trans>}
        </SubmitButtonStyled>

        <ActionsRowStyled>
          <Button
            size="small"
            type="button"
            disabled={isSending}
            onClick={() => sendCode(email.trim())}
          >
            <Trans>Resend code</Trans>
          </Button>

          <Button size="small" type="button" onClick={handleBackToEmail}>
            <Trans>Use another email</Trans>
          </Button>
        </ActionsRowStyled>
      </FormStyled>
    );
  }

  return (
    <FormStyled onSubmit={handleSendCode}>
      <TextField
        fullWidth
        value={email}
        type="email"
        placeholder={t`Enter email address`}
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
      />

      <SubmitButtonStyled
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isSending}
      >
        {isSending ? <Trans>Sending code…</Trans> : <Trans>Continue</Trans>}
      </SubmitButtonStyled>
    </FormStyled>
  );
};

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const SubmitButtonStyled = styled(Button)`
  height: 48px;
`;

const HintStyled = styled(Typography)`
  text-align: center;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ActionsRowStyled = styled('div')`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
