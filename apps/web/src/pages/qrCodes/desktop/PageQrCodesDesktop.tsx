import { Trans, useLingui } from '@lingui/react/macro';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useApiSectorQrs, useDownloadQrPlaques } from '@web/features/sectorQr';
import { ApiFeedback, EmptyState, ListSkeleton } from '@web/shared/ui';

import { useQrCodesTable } from '../common';
import { QrCodesTable } from './ui';

export const PageQrCodesDesktop = () => {
  const { t } = useLingui();
  const { rows, isLoading, failure } = useApiSectorQrs({});
  const table = useQrCodesTable(rows);
  const { isPending: isDownloading, download } = useDownloadQrPlaques();

  const chosen = table.selectedRows.length
    ? table.selectedRows
    : table.visibleRows;
  const printable = chosen.filter(({ path }) => !!path);

  return (
    <PageStyled>
      <ToolbarStyled>
        <RegionFieldStyled
          select
          size="small"
          label={t`Region`}
          value={table.idRegion}
          slotProps={{
            inputLabel: { shrink: true },
            select: {
              displayEmpty: true,
              renderValue: (value) =>
                table.regions.find(({ idRegion }) => idRegion === value)
                  ?.regionName ?? t`Choose a region`
            }
          }}
          onChange={(event) => table.selectRegion(event.target.value)}
        >
          {table.regions.map(({ idRegion, regionName }) => (
            <MenuItem key={idRegion} value={idRegion}>
              {regionName}
            </MenuItem>
          ))}
        </RegionFieldStyled>
        {table.idRegion && (
          <ActionsStyled>
            <Typography variant="body2" color="textSecondary">
              <Trans>
                {table.coverage.withPath} of {table.coverage.total} sectors have
                a QR code
              </Trans>
            </Typography>
            <Button
              variant="contained"
              disabled={!printable.length || isDownloading}
              onClick={() => download(printable, 'crag-atlas-qr-codes.pdf')}
            >
              {table.selectedRows.length ? (
                <Trans>Download selected ({printable.length})</Trans>
              ) : (
                <Trans>Download all ({printable.length})</Trans>
              )}
            </Button>
          </ActionsStyled>
        )}
      </ToolbarStyled>

      <ApiFeedback failure={failure} />
      {isLoading && <ListSkeleton count={4} variant="row" />}
      {!isLoading && !failure && !table.idRegion && (
        <EmptyState
          isLarge
          icon={<QrCode2Icon />}
          message={
            <Trans>Choose a region to see its sectors and QR codes.</Trans>
          }
        />
      )}
      {!isLoading && !failure && table.idRegion && (
        <>
          <Alert severity="info">
            <AlertTitle>
              <Trans>How QR codes work</Trans>
            </AlertTitle>
            <ListStyled>
              <li>
                <Trans>
                  Renaming the sector, in Ukrainian or English, does not touch
                  its QR code: a printed plaque still opens it.
                </Trans>
              </li>
              <li>
                <Trans>
                  You can edit a QR code's address. The old address stays and
                  keeps working; the new one is added alongside it for the next
                  plaques.
                </Trans>
              </li>
              <li>
                <Trans>
                  A QR code's link cannot be deleted. It only goes away with the
                  sector, if the sector is deleted for good, and then its
                  printed plaques stop working.
                </Trans>
              </li>
            </ListStyled>
          </Alert>
          <QrCodesTable table={table} />
        </>
      )}
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const ToolbarStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const RegionFieldStyled = styled(TextField)`
  min-width: 240px;
`;

const ActionsStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-left: auto;
`;

const ListStyled = styled('ul')`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing(2.5)};
`;
