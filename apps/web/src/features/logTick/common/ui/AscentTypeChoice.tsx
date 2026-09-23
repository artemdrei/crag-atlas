import { useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { ASCENT_TYPES, type AscentType, AscentTypeLabel } from '@web/shared/ui';

export interface Props {
  value: AscentType;
  onChange: (value: AscentType) => void;
}

export const AscentTypeChoice = ({ value, onChange }: Props) => {
  const { t } = useLingui();

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={t`Ascent type`}
      value={value}
      onChange={(event) => onChange(event.target.value as AscentType)}
    >
      {ASCENT_TYPES.map((ascentType) => (
        <MenuItem key={ascentType} value={ascentType}>
          <AscentTypeLabel ascentType={ascentType} />
        </MenuItem>
      ))}
    </TextField>
  );
};
