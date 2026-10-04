import { useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { ASCENT_TYPES, type AscentType, AscentTypeLabel } from '@web/shared/ui';

import { FIRST_ASCENT_TYPES } from '../lib';

export interface Props {
  value: AscentType;
  isFirstAscentLocked?: boolean;
  onChange: (value: AscentType) => void;
}

export const AscentTypeChoice = ({
  value,
  isFirstAscentLocked = false,
  onChange
}: Props) => {
  const { t } = useLingui();

  return (
    <TextField
      select
      required
      fullWidth
      size="small"
      label={t`Ascent type`}
      helperText={
        isFirstAscentLocked
          ? t`Onsight and flash count on the first ascent only`
          : undefined
      }
      value={value}
      onChange={(event) => onChange(event.target.value as AscentType)}
    >
      {ASCENT_TYPES.map((ascentType) => (
        <MenuItem
          key={ascentType}
          value={ascentType}
          disabled={
            isFirstAscentLocked && FIRST_ASCENT_TYPES.includes(ascentType)
          }
        >
          <AscentTypeLabel ascentType={ascentType} />
        </MenuItem>
      ))}
    </TextField>
  );
};
