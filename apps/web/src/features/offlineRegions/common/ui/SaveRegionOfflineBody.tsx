import type { OfflineSource } from '@crag-atlas/analytics';
import { Plural, Trans } from '@lingui/react/macro';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useSaveRegionOffline } from '../hooks';
import { OfflineDownloadProgress } from './OfflineDownloadProgress';

export interface Props {
  idRegion: string;
  source: OfflineSource;
  onClose: () => void;
}

export const SaveRegionOfflineBody = ({ idRegion, source, onClose }: Props) => {
  const save = useSaveRegionOffline(idRegion, source);
  const name = save.region?.name ?? '';

  if (save.stage === 'success') {
    return (
      <BodyStyled>
        <HeroStyled>
          <SuccessIconStyled>
            <CheckCircleOutlinedIcon fontSize="inherit" />
          </SuccessIconStyled>
          <Typography variant="h6">
            <Trans>{name} is saved</Trans>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Trans>
              Its routes, photos and lines now open without the internet. You
              can refresh or remove it in your profile.
            </Trans>
          </Typography>
        </HeroStyled>
        <StackedActionsStyled>
          <Button fullWidth size="large" variant="contained" onClick={onClose}>
            <Trans>Done</Trans>
          </Button>
        </StackedActionsStyled>
      </BodyStyled>
    );
  }

  const isDownloading = save.stage === 'downloading';

  return (
    <BodyStyled>
      <HeroStyled>
        <IconStyled>
          <CloudDownloadOutlinedIcon fontSize="inherit" />
        </IconStyled>
        {save.region ? (
          <>
            <Typography variant="h6">{save.region.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              <Plural
                value={save.region.routeCount}
                one="# route"
                other="# routes"
              />
              {' · '}
              <Plural
                value={save.region.sectorCount}
                one="# sector"
                other="# sectors"
              />
            </Typography>
          </>
        ) : (
          <>
            <Skeleton width={160} height={32} />
            <Skeleton width={120} />
          </>
        )}
        <Typography variant="body2" color="text.secondary">
          <Trans>
            Save it once, and every route, photo and line on it will open
            without the internet.
          </Trans>
        </Typography>
      </HeroStyled>

      {!save.isOnline && (
        <Alert severity="warning" icon={false}>
          <Trans>Connect to the internet to save this region.</Trans>
        </Alert>
      )}

      {save.isOnline && save.isConnectionSlow && (
        <Alert
          severity="info"
          icon={
            <SignalWifiStatusbarConnectedNoInternet4Icon fontSize="inherit" />
          }
        >
          <Trans>
            Your connection is slow right now, so the download may take a while.
            Keep the app open until it finishes.
          </Trans>
        </Alert>
      )}

      {save.errorMessage && <Alert severity="error">{save.errorMessage}</Alert>}

      {save.progressLabel && (
        <ProgressStyled>
          <OfflineDownloadProgress
            label={save.progressLabel}
            percent={save.progressPercent}
          />
          {save.downloaded && (
            <Typography variant="caption" color="text.secondary">
              {save.speed
                ? `${save.downloaded} · ${save.speed}`
                : save.downloaded}
            </Typography>
          )}
        </ProgressStyled>
      )}

      <StackedActionsStyled>
        <Button
          fullWidth
          size="large"
          variant="contained"
          disabled={!save.canDownload}
          startIcon={<CloudDownloadOutlinedIcon />}
          onClick={save.download}
        >
          {save.stage === 'error' ? (
            <Trans>Try again</Trans>
          ) : isDownloading ? (
            <Trans>Downloading…</Trans>
          ) : (
            <Trans>Download</Trans>
          )}
        </Button>
        {!isDownloading && (
          <Button fullWidth onClick={onClose}>
            <Trans>Not now</Trans>
          </Button>
        )}
      </StackedActionsStyled>
    </BodyStyled>
  );
};

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const HeroStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

const IconStyled = styled('span')`
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: 50%;
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 40px;
`;

const SuccessIconStyled = styled(IconStyled)`
  background-color: ${({ theme }) => alpha(theme.palette.success.main, 0.12)};
  color: ${({ theme }) => theme.palette.success.main};
`;

const ProgressStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StackedActionsStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;
