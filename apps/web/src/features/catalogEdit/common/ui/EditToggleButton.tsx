import { Trans } from '@lingui/react/macro';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';

import { useUser } from '@web/app/providers';

export interface Props {
  onClick: () => void;
}

/** Renders nothing for everyone but an admin — the guard is the DB, this is the affordance. */
export const EditToggleButton = ({ onClick }: Props) => {
  const { hasRole } = useUser();

  if (!hasRole('admin')) return null;

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<EditIcon />}
      onClick={onClick}
    >
      <Trans>Edit</Trans>
    </Button>
  );
};
