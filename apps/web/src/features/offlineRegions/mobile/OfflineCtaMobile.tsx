import { Trans } from '@lingui/react/macro';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

import { useOfflineRegionCta } from '../common';

export interface Props {
  idRegion: string;
}

export const OfflineCtaMobile = ({ idRegion }: Props) => {
  const cta = useOfflineRegionCta(idRegion);

  if (!cta.isVisible) return null;

  return (
    <ButtonStyled
      size="small"
      variant="contained"
      color="secondary"
      startIcon={
        cta.isDownloading ? (
          <CircularProgress
            color="inherit"
            size={14}
            variant={
              cta.progressPercent === null ? 'indeterminate' : 'determinate'
            }
            value={cta.progressPercent ?? undefined}
          />
        ) : (
          <CloudDownloadOutlinedIcon fontSize="small" />
        )
      }
      onClick={cta.open}
    >
      {cta.isDownloading ? <Trans>Saving…</Trans> : <Trans>Offline</Trans>}
    </ButtonStyled>
  );
};

const ButtonStyled = styled(Button)`
  flex-shrink: 0;
  border-radius: 999px;
  text-transform: none;
  white-space: nowrap;
`;
