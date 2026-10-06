import { Link } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useUser } from '@web/app/providers';
import { ROUTES } from '@web/app/router/routes';

import { ProfileSettingRow } from './ProfileSettingRow';

export const AdminSetting = () => {
  const { hasRole } = useUser();

  if (!hasRole('admin')) return null;

  return (
    <ProfileSettingRow label={<Trans>Admin</Trans>}>
      <Button color="inherit" component={Link} to={ROUTES.ADMIN}>
        <Trans>Open</Trans>
      </Button>
    </ProfileSettingRow>
  );
};
