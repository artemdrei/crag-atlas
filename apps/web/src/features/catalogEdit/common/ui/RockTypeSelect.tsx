import type { RockType } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';

import { ChangedTextField, useRockTypeLabels } from '@web/shared/ui';

export interface Props {
  value: RockType;
  isChanged?: boolean;
  isCompact?: boolean;
  onChange: (rockType: RockType) => void;
}

export const RockTypeSelect = ({
  value,
  isChanged,
  isCompact,
  onChange
}: Props) => {
  const { t } = useLingui();
  const labels = useRockTypeLabels();

  return (
    <ChangedTextField
      select
      fullWidth
      size={isCompact ? 'small' : undefined}
      label={t`Rock type`}
      helperText={t`Decides how fast the conditions forecast lets the rock dry after rain.`}
      value={value}
      isChanged={isChanged}
      onChange={(event) => onChange(event.target.value as RockType)}
    >
      {(Object.keys(labels) as RockType[]).map((rockType) => (
        <MenuItem key={rockType} value={rockType}>
          {labels[rockType]}
        </MenuItem>
      ))}
    </ChangedTextField>
  );
};
