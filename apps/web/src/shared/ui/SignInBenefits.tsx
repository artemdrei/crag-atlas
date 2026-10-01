import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import DevicesIcon from '@mui/icons-material/Devices';
import GroupsIcon from '@mui/icons-material/Groups';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import TerrainIcon from '@mui/icons-material/Terrain';
import TimelineIcon from '@mui/icons-material/Timeline';
import Paper from '@mui/material/Paper';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { SignInCta } from './SignInCta';

export interface Props {
  to: string;
  from?: string;
  message: ReactNode;
  className?: string;
  onSignIn?: () => void;
}

export const SignInBenefits = ({
  to,
  from,
  message,
  className,
  onSignIn
}: Props) => (
  <CardStyled className={className} elevation={0}>
    <MessageStyled variant="body1">{message}</MessageStyled>

    <BenefitsStyled>
      <RowStyled>
        <IconStyled>
          <TimelineIcon fontSize="small" />
        </IconStyled>
        <Typography variant="body2">
          <Trans>Log every ascent and watch your grade pyramid build up</Trans>
        </Typography>
      </RowStyled>
      <RowStyled>
        <IconStyled>
          <GroupsIcon fontSize="small" />
        </IconStyled>
        <Typography variant="body2">
          <Trans>See what everyone else has climbed on a route</Trans>
        </Typography>
      </RowStyled>
      <RowStyled>
        <IconStyled>
          <TerrainIcon fontSize="small" />
        </IconStyled>
        <Typography variant="body2">
          <Trans>Track your progress sector by sector</Trans>
        </Typography>
      </RowStyled>
      <RowStyled>
        <IconStyled>
          <PhotoCameraOutlinedIcon fontSize="small" />
        </IconStyled>
        <Typography variant="body2">
          <Trans>Add beta and photos that help the next climber</Trans>
        </Typography>
      </RowStyled>
      <RowStyled>
        <IconStyled>
          <DevicesIcon fontSize="small" />
        </IconStyled>
        <Typography variant="body2">
          <Trans>Keep your grades, language and theme on every device</Trans>
        </Typography>
      </RowStyled>
    </BenefitsStyled>

    <SignInCta to={to} from={from} isFullWidth onSignIn={onSignIn} />
  </CardStyled>
);

const CardStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  width: 100%;
  max-width: 480px;
  margin-inline: auto;
  align-self: center;
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: calc(${({ theme }) => theme.shape.borderRadius}px * 1.5);
  background-color: ${({ theme }) => theme.palette.background.paper};
`;

const MessageStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const BenefitsStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.75)};
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const IconStyled = styled('span')`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
`;
