import { Trans } from '@lingui/react/macro';
import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';

export interface Props {
  isPending?: boolean;
  onClick: () => void;
}

export const RestoreButton = ({ isPending, onClick }: Props) => (
  <Button
    type="button"
    size="small"
    variant="outlined"
    startIcon={<RestoreIcon fontSize="small" />}
    disabled={isPending}
    onClick={onClick}
  >
    <Trans>Restore</Trans>
  </Button>
);
