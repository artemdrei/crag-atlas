import { useRef } from 'react';

import { useLingui } from '@lingui/react/macro';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { MIN_SEARCH_LENGTH } from '../lib';

export interface Props {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export const CatalogSearchField = ({ value, onChange, onFocus }: Props) => {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const typed = value.trim().length;

  // Clearing is the start of typing something else, so the caret stays put.
  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <FieldStyled
      fullWidth
      size="small"
      value={value}
      inputRef={inputRef}
      placeholder={t`Search a region, sector or route`}
      // Blank rather than none: the hint must not resize the column.
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
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                edge="end"
                aria-label={t`Clear the search`}
                onClick={handleClear}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
      }}
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const FieldStyled = styled(TextField)`
  .MuiFormHelperText-root {
    margin-top: ${({ theme }) => theme.spacing(0.25)};
    line-height: 1.2;
  }
`;
