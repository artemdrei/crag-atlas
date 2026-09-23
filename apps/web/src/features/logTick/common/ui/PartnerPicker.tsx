import { useState } from 'react';

import type { UserSummary } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { UserAvatar } from '@web/shared/ui';

import { MIN_SEARCH_LENGTH, useApiSearchUsers } from '../hooks';

export interface Props {
  value: UserSummary | null;
  onChange: (value: UserSummary | null) => void;
}

export const PartnerPicker = ({ value, onChange }: Props) => {
  const { t } = useLingui();
  const [query, setQuery] = useState('');
  const { climbers, isLoading, term } = useApiSearchUsers(query);

  return (
    <Autocomplete
      size="small"
      value={value}
      options={climbers}
      loading={isLoading}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.displayName}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      noOptionsText={
        term.length < MIN_SEARCH_LENGTH
          ? t`Type at least ${MIN_SEARCH_LENGTH} letters of a name`
          : t`Nobody found`
      }
      renderOption={({ key, ...props }, option) => (
        <OptionStyled key={key} {...props}>
          <AvatarStyled
            name={option.displayName}
            avatarUrl={option.avatarUrl ?? undefined}
          />
          {option.displayName}
        </OptionStyled>
      )}
      renderInput={(params) => <TextField {...params} label={t`Partner`} />}
      onInputChange={(_event, next) => setQuery(next)}
      onChange={(_event, next) => onChange(next)}
    />
  );
};

const OptionStyled = styled('li')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const AvatarStyled = styled(UserAvatar)`
  width: 28px;
  height: 28px;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;
