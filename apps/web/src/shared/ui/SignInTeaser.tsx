import { type ReactNode, useEffect } from 'react';

import { type SignInPromptAction, track } from '@crag-atlas/analytics';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PageShell } from './PageShell';
import { SignInBenefits } from './SignInBenefits';

export interface Props {
  to: string;
  from?: string;
  action: SignInPromptAction;
  title: ReactNode;
  message: ReactNode;
  isCompact?: boolean;
}

export const SignInTeaser = ({
  to,
  from,
  action,
  title,
  message,
  isCompact
}: Props) => {
  useEffect(() => {
    track({ name: 'Sign In Prompted', props: { action } });
  }, [action]);

  return (
    <PageShell spacing={3} isCompact={isCompact}>
      <TitleStyled variant={isCompact ? 'h5' : 'h4'}>{title}</TitleStyled>
      <SignInBenefits to={to} from={from} message={message} />
    </PageShell>
  );
};

const TitleStyled = styled(Typography)`
  text-align: center;
`;
