import type { Region } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export interface Props {
  options: Region[];
  value: Region | null;
  isLoading: boolean;
  isDisabled: boolean;
  onChange: (region: Region | null) => void;
}

export const OfflineRegionPicker = ({
  options,
  value,
  isLoading,
  isDisabled,
  onChange
}: Props) => {
  const { t } = useLingui();

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      size="small"
      value={value}
      options={options}
      loading={isLoading}
      disabled={isDisabled}
      getOptionLabel={(region) => region.name}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      noOptionsText={t`No region found`}
      renderInput={(params) => <TextField {...params} label={t`Region`} />}
      onChange={(_event, next) => onChange(next)}
    />
  );
};
