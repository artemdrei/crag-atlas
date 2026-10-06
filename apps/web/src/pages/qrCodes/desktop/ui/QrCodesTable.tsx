import type { SectorQr } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {
  CreateQrButton,
  QrCodeImage,
  QrSlugEditor,
  QrWarnings,
  qrUrlOf
} from '@web/features/sectorQr';

import type { QrCodesTableState } from '../../common';

export interface Props {
  table: QrCodesTableState;
}

export const QrCodesTable = ({ table }: Props) => {
  const { t } = useLingui();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={table.isAllSelected}
              indeterminate={table.isSomeSelected}
              slotProps={{ input: { 'aria-label': t`Select every sector` } }}
              onChange={table.toggleAll}
            />
          </TableCell>
          <TableCell>
            <Trans>Sector</Trans>
          </TableCell>
          <TableCell>
            <Trans>QR code</Trans>
          </TableCell>
          <TableCell>
            <Trans>Address</Trans>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {table.visibleRows.map((row) => (
          <QrCodeRow
            key={row.idSector}
            row={row}
            isSelected={table.isSelected(row.idSector)}
            onToggle={() => table.toggle(row.idSector)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

interface QrCodeRowProps {
  row: SectorQr;
  isSelected: boolean;
  onToggle: () => void;
}

const QrCodeRow = ({ row, isSelected, onToggle }: QrCodeRowProps) => {
  const { t } = useLingui();

  return (
    <TableRow selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          slotProps={{
            input: { 'aria-label': t`Select ${row.sectorName}` }
          }}
          onChange={onToggle}
        />
      </TableCell>
      <TableCell>
        <NameStyled variant="subtitle1">
          {row.sectorNameLocal || row.sectorName}
        </NameStyled>
        {row.sectorNameLocal && row.sectorNameLocal !== row.sectorName && (
          <Typography variant="body2" color="textSecondary">
            {row.sectorName}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {row.path ? (
          <QrCodeImage
            url={qrUrlOf(window.location.origin, row.path)}
            label={t`QR code of ${row.sectorName}`}
            size={140}
          />
        ) : (
          <CreateQrButton row={row} size="small" />
        )}
      </TableCell>
      <AddressCellStyled>
        {row.path && (
          <QrSlugEditor
            key={row.path}
            idSector={row.idSector}
            path={row.path}
          />
        )}
        <QrWarnings row={row} />
      </AddressCellStyled>
    </TableRow>
  );
};

const NameStyled = styled(Typography)`
  font-weight: 600;
`;

const AddressCellStyled = styled(TableCell)`
  min-width: 320px;

  & > * + * {
    margin-top: ${({ theme }) => theme.spacing(1)};
  }
`;
