import type { SectorQr } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback, ListSkeleton } from '@web/shared/ui';

import { qrUrlOf, useApiSectorQrs } from '../common';
import { CreateQrButton } from './CreateQrButton';
import { QrCodeImage } from './QrCodeImage';
import { QrSlugEditor } from './QrSlugEditor';
import { QrWarnings } from './QrWarnings';
import { useDownloadQrPlaques } from './useDownloadQrPlaques';

export interface Props {
  idSector: string;
}

export const SectorQrPanel = ({ idSector }: Props) => {
  const { rows, isLoading, failure } = useApiSectorQrs({ idSector });
  const [row] = rows;

  if (isLoading) return <ListSkeleton count={1} variant="row" />;
  if (failure || !row) return <ApiFeedback failure={failure} />;

  return (
    <PanelStyled>
      <QrWarnings row={row} />
      {row.path ? (
        <SectorQrCode row={row} path={row.path} />
      ) : (
        <CreateQrButton row={row} />
      )}
    </PanelStyled>
  );
};

interface SectorQrCodeProps {
  row: SectorQr;
  path: string;
}

const SectorQrCode = ({ row, path }: SectorQrCodeProps) => {
  const { t } = useLingui();
  const { isPending, download } = useDownloadQrPlaques();
  const url = qrUrlOf(window.location.origin, path);

  return (
    <>
      <CodeStyled>
        <QrCodeImage url={url} label={t`QR code of ${row.sectorName}`} />
        <Button
          variant="contained"
          disabled={isPending}
          onClick={() => download([row], `qr-${path.replace(/\//g, '-')}.pdf`)}
        >
          <Trans>Download PDF</Trans>
        </Button>
      </CodeStyled>
      <QrSlugEditor key={path} idSector={row.idSector} path={path} />
      {row.oldPaths.length > 0 && (
        <div>
          <Typography variant="caption" color="textSecondary">
            <Trans>Earlier addresses, still opening this sector:</Trans>
          </Typography>
          {row.oldPaths.map((path) => (
            <OldPathStyled key={path} variant="body2">
              /q/{path}
            </OldPathStyled>
          ))}
        </div>
      )}
    </>
  );
};

const PanelStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const CodeStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const OldPathStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  word-break: break-all;
`;
