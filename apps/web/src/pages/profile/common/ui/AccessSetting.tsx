import { Link } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useUser } from '@web/app/providers';
import { ROUTES } from '@web/app/router/routes';

import { ProfileSettingRow } from './ProfileSettingRow';

export const AccessSetting = () => {
  const { hasRole } = useUser();

  if (!hasRole('admin')) return null;

  return (
    <ProfileSettingRow label={<Trans>Access</Trans>}>
      <Button color="inherit" component={Link} to={ROUTES.ACCESS}>
        <Trans>Manage admins</Trans>
      </Button>
    </ProfileSettingRow>
  );
};
