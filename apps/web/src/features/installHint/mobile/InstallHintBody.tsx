import { Trans } from '@lingui/react/macro';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useInstallHint } from '../common';

export interface Props {
  onClose: () => void;
}

export const InstallHintBody = ({ onClose }: Props) => {
  const { steps, canInstall, install } = useInstallHint();

  const handleInstall = async () => {
    await install();
    onClose();
  };

  return (
    <BodyStyled>
      <LeadStyled variant="body2">
        <Trans>
          Add crag-atlas to your home screen: it opens in one tap, full screen,
          like any other app.
        </Trans>
      </LeadStyled>

      <StepsStyled>
        {steps.map((step, index) => (
          <StepStyled key={step}>
            <StepNumberStyled>{index + 1}</StepNumberStyled>
            <Typography variant="body2">{step}</Typography>
          </StepStyled>
        ))}
      </StepsStyled>

      <OfflineStyled>
        <OfflineIconStyled>
          <CloudDownloadOutlinedIcon fontSize="small" />
        </OfflineIconStyled>
        <div>
          <Typography variant="subtitle2">
            <Trans>Works with no signal</Trans>
          </Typography>
          <LeadStyled variant="body2">
            <Trans>
              Before a trip, save a region in Profile → Offline regions. Its
              topos then open at the crag with no connection.
            </Trans>
          </LeadStyled>
        </div>
      </OfflineStyled>

      <ActionsStyled>
        {canInstall && (
          <Button variant="contained" fullWidth onClick={handleInstall}>
            <Trans>Install</Trans>
          </Button>
        )}
        <Button
          variant={canInstall ? 'text' : 'contained'}
          fullWidth
          onClick={onClose}
        >
          <Trans>Got it</Trans>
        </Button>
      </ActionsStyled>
    </BodyStyled>
  );
};

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const LeadStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const StepsStyled = styled('ol')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const StepStyled = styled('li')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const StepNumberStyled = styled('span')`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
`;

const OfflineStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const OfflineIconStyled = styled('span')`
  display: inline-flex;
  flex: none;
  padding-top: ${({ theme }) => theme.spacing(0.25)};
  color: ${({ theme }) => theme.palette.primary.main};
`;

const ActionsStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;
