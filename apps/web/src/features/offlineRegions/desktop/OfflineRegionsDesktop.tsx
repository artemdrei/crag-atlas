import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  OfflineDownloadProgress,
  OfflineRegionPicker,
  OfflineRegionRow,
  useOfflineRegionsPanel
} from '../common';

export const OfflineRegionsDesktop = () => {
  const panel = useOfflineRegionsPanel();

  return (
    <SectionStyled elevation={0}>
      <div>
        <Typography variant="body1">
          <Trans>Offline regions</Trans>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Trans>
            Save a region with its sectors, routes and topos to open it without
            a connection.
          </Trans>
        </Typography>
      </div>

      <ControlsStyled>
        <OfflineRegionPicker
          options={panel.options}
          value={panel.selected}
          isLoading={panel.isRegionsLoading}
          isDisabled={!panel.isOnline || panel.isDownloading}
          onChange={panel.select}
        />
        <Button
          variant="contained"
          disabled={!panel.canDownload}
          onClick={panel.download}
        >
          <Trans>Save</Trans>
        </Button>
      </ControlsStyled>

      {!panel.isOnline && (
        <Typography variant="caption" color="text.secondary">
          <Trans>Connect to the internet to save or refresh a region.</Trans>
        </Typography>
      )}

      {panel.progressLabel && (
        <OfflineDownloadProgress
          label={panel.progressLabel}
          percent={panel.progressPercent}
        />
      )}

      {panel.rows.length ? (
        <ListStyled>
          {panel.rows.map((row) => (
            <OfflineRegionRow
              key={row.id}
              name={row.name}
              path={row.path}
              details={row.details}
              isRefreshing={row.isRefreshing}
              isRefreshDisabled={!panel.isOnline || panel.isDownloading}
              onRefresh={() => panel.refresh(row.id)}
              onDelete={() => panel.remove(row.id)}
            />
          ))}
        </ListStyled>
      ) : (
        <Typography variant="body2" color="text.secondary">
          <Trans>No regions saved yet.</Trans>
        </Typography>
      )}
    </SectionStyled>
  );
};

const SectionStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ControlsStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const ListStyled = styled('ul')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
  padding: 0;
  list-style: none;
`;
