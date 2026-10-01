import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

import { useModal } from '@web/app/providers';

export interface Props {
  isFullWidth?: boolean;
}

export const GrantAdminButton = ({ isFullWidth }: Props) => {
  const { openModal } = useModal();

  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      fullWidth={isFullWidth}
      onClick={() => openModal('GRANT_ADMIN')}
    >
      <Trans>Add admin</Trans>
    </Button>
  );
};
