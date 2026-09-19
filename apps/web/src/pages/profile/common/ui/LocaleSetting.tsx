import { Trans } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import type { Locale } from '@web/shared/i18n/i18n';

import { useLocaleSetting } from '../hooks';
import { ProfileSettingRow } from './ProfileSettingRow';

// Language names stay in their own language — they're proper nouns, not UI copy.
const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська'
};

export const LocaleSetting = () => {
  const { locale, changeLocale } = useLocaleSetting();

  return (
    <ProfileSettingRow label={<Trans>Language</Trans>}>
      <Select
        size="small"
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
      >
        {Object.entries(LOCALE_LABELS).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </ProfileSettingRow>
  );
};
