import { Link } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { keyframes, styled } from '@mui/material/styles';

export interface Props {
  to: string;
  from?: string;
  isFullWidth?: boolean;
  className?: string;
  onSignIn?: () => void;
}

export const SignInCta = ({
  to,
  from,
  isFullWidth,
  className,
  onSignIn
}: Props) => (
  <FrameStyled className={className} isFullWidth={!!isFullWidth}>
    <ButtonStyled
      variant="contained"
      disableElevation
      fullWidth={isFullWidth}
      component={Link}
      to={to}
      state={from ? { from } : undefined}
      onClick={onSignIn}
    >
      <Trans>Sign in</Trans>
    </ButtonStyled>
  </FrameStyled>
);

const sweep = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

// A rotating gradient square clipped by the frame's padding: a border cannot
// be animated this way.
const FrameStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isFullWidth'
})<{ isFullWidth: boolean }>`
  position: relative;
  display: ${({ isFullWidth }) => (isFullWidth ? 'block' : 'inline-block')};
  padding: 2px;
  border-radius: calc(${({ theme }) => theme.shape.borderRadius}px + 4px);
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 180%;
    aspect-ratio: 1;
    translate: -50% -50%;
    background: conic-gradient(
      ${({ theme }) => theme.palette.primary.main},
      ${({ theme }) => theme.palette.secondary.main},
      ${({ theme }) => theme.palette.primary.main}
    );
    animation: ${sweep} 3s linear infinite;
    z-index: -1;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;

const ButtonStyled = styled(Button)`
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  font-weight: 600;
` as typeof Button;
