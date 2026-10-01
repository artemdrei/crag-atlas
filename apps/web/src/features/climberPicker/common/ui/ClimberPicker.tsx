import { useState } from 'react';

import type { UserSummary } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import { ChangedTextField, UserAvatar } from '@web/shared/ui';

import { MIN_SEARCH_LENGTH, useApiSearchUsers } from '../hooks';

const AVATAR_SIZE = 28;

export interface Props {
  value: UserSummary | null;
  label: string;
  name?: string;
  isChanged?: boolean;
  onChange: (value: UserSummary | null) => void;
  onNameChange?: (name: string) => void;
}

// Passing `onNameChange` opens the field to a name the search cannot find.
export const ClimberPicker = ({
  value,
  label,
  name,
  isChanged,
  onChange,
  onNameChange
}: Props) => {
  const { t } = useLingui();
  const [query, setQuery] = useState('');
  const { climbers, isLoading, term } = useApiSearchUsers(query);

  const handleChange = (next: UserSummary | string | null) => {
    if (typeof next === 'string') {
      onChange(null);
      onNameChange?.(next);
      return;
    }

    onChange(next);
    onNameChange?.('');
  };

  return (
    <Autocomplete<UserSummary, false, false, boolean>
      size="small"
      freeSolo={!!onNameChange}
      value={value ?? name ?? null}
      options={climbers}
      loading={isLoading}
      filterOptions={(options) => options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.displayName
      }
      isOptionEqualToValue={(option, selected) =>
        typeof selected !== 'string' && option.id === selected.id
      }
      noOptionsText={
        term.length < MIN_SEARCH_LENGTH
          ? t`Type at least ${MIN_SEARCH_LENGTH} letters of a name`
          : t`Nobody found`
      }
      renderOption={({ key, ...props }, option) => (
        <OptionStyled key={key} {...props}>
          <UserAvatar
            name={option.displayName}
            avatarUrl={option.avatarUrl ?? undefined}
            size={AVATAR_SIZE}
          />
          {option.displayName}
        </OptionStyled>
      )}
      renderInput={(params) => (
        <ChangedTextField {...params} label={label} isChanged={isChanged} />
      )}
      onInputChange={(_event, next, reason) => {
        setQuery(next);

        // Typing over a picked climber unlinks them.
        if (onNameChange && reason === 'input') {
          onChange(null);
          onNameChange(next);
        }
      }}
      onChange={(_event, next) => handleChange(next)}
    />
  );
};

const OptionStyled = styled('li')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
