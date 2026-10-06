import type { SectorQr } from '@crag-atlas/api';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { qrWarningsOf, useQrWarningLabels } from '../common';

export interface Props {
  row: SectorQr;
}

export const QrWarnings = ({ row }: Props) => {
  const labels = useQrWarningLabels();
  const warnings = qrWarningsOf(row);

  if (!warnings.length) return null;

  return (
    <ListStyled>
      {warnings.map((warning) => (
        <ItemStyled key={warning}>
          <WarningAmberIcon fontSize="inherit" />
          <Typography variant="body2">{labels[warning]}</Typography>
        </ItemStyled>
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('ul')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ItemStyled = styled('li')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
  color: ${({ theme }) => theme.palette.warning.main};
`;
