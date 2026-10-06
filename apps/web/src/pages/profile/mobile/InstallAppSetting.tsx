import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useOpenInstallHint } from '@web/features/installHint';

import { ProfileSettingRow } from '../common';

export const InstallAppSetting = () => {
  const { isInstalled, openInstallHint } = useOpenInstallHint();

  if (isInstalled) return null;

  return (
    <ProfileSettingRow label={<Trans>App</Trans>}>
      <Button color="inherit" onClick={openInstallHint}>
        <Trans>Install as app</Trans>
      </Button>
    </ProfileSettingRow>
  );
};
