import { Trans } from '@lingui/react/macro';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Button from '@mui/material/Button';

export interface Props {
  isOn: boolean;
  onToggle: () => void;
}

export const ArchivedToggle = ({ isOn, onToggle }: Props) => (
  <Button
    size="small"
    variant={isOn ? 'contained' : 'outlined'}
    startIcon={<Inventory2OutlinedIcon fontSize="small" />}
    onClick={onToggle}
  >
    {isOn ? <Trans>Back to the catalog</Trans> : <Trans>Archive</Trans>}
  </Button>
);
