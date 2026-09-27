import { useMemo } from 'react';

import { useLingui } from '@lingui/react/macro';
import Autocomplete from '@mui/material/Autocomplete';

import { countryCodes, countryName } from '@web/shared/lib';
import { ChangedTextField } from '@web/shared/ui';

export interface Props {
  value?: string | null;
  isChanged?: boolean;
  isCompact?: boolean;
  onChange: (value: string | null) => void;
}

export const CountryPicker = ({
  value,
  isChanged,
  isCompact,
  onChange
}: Props) => {
  const { t, i18n } = useLingui();
  const codes = useMemo(() => countryCodes(i18n.locale), [i18n.locale]);

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      size={isCompact ? 'small' : 'medium'}
      value={value || null}
      options={codes}
      getOptionLabel={(code) => countryName(code, i18n.locale)}
      noOptionsText={t`No country found`}
      renderInput={(params) => (
        <ChangedTextField
          {...params}
          label={t`Country`}
          isChanged={isChanged}
        />
      )}
      onChange={(_event, next) => onChange(next)}
    />
  );
};
