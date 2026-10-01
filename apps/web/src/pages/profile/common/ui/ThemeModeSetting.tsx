import { track } from '@crag-atlas/analytics';
import { Trans } from '@lingui/react/macro';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useThemeMode } from '@web/shared/theme/ThemeModeProvider';

import { ProfileSettingRow } from './ProfileSettingRow';

export const ThemeModeSetting = () => {
  const { mode, toggle } = useThemeMode();

  return (
    <ProfileSettingRow label={<Trans>Theme</Trans>}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_event, next) => {
          if (!next || next === mode) return;

          track({
            name: 'Setting Changed',
            props: { setting: 'theme', value: next }
          });
          toggle();
        }}
      >
        <ToggleButton value="light">
          <Trans>Light</Trans>
        </ToggleButton>
        <ToggleButton value="dark">
          <Trans>Dark</Trans>
        </ToggleButton>
      </ToggleButtonGroup>
    </ProfileSettingRow>
  );
};
