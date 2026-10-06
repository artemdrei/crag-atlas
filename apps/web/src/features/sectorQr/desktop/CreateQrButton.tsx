import type { SectorQr } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useApiCreateQrPaths } from '../common';

export interface Props {
  row: SectorQr;
  size?: 'small' | 'medium';
}

export const CreateQrButton = ({ row, size }: Props) => {
  const { isPending, createQrPaths } = useApiCreateQrPaths();

  return (
    <Button
      variant="outlined"
      size={size}
      disabled={!row.country || isPending}
      onClick={() => createQrPaths([row.idSector])}
    >
      <Trans>Create a QR code</Trans>
    </Button>
  );
};
