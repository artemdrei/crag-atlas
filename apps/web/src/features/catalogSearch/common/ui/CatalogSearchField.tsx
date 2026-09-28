import { useLingui } from '@lingui/react/macro';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { MIN_SEARCH_LENGTH } from '../lib';

export interface Props {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export const CatalogSearchField = ({ value, onChange, onFocus }: Props) => {
  const { t } = useLingui();
  const typed = value.trim().length;

  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      placeholder={t`Search a region, sector or route`}
      // A blank helper text rather than none: the field must not resize the
      // column under it the moment the hint appears.
      helperText={
        typed > 0 && typed < MIN_SEARCH_LENGTH
          ? t`Type at least ${MIN_SEARCH_LENGTH} letters`
          : ' '
      }
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          )
        }
      }}
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
