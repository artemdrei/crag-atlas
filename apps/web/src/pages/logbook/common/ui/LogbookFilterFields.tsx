import { Trans, useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { ASCENT_TYPES, AscentTypeLabel } from '@web/shared/ui';

import type { AscentFilter, TickSort } from '../entities';

export interface Props {
  sort: TickSort;
  ascentType: AscentFilter;
  onSortChange: (sort: TickSort) => void;
  onAscentTypeChange: (ascentType: AscentFilter) => void;
}

export const LogbookFilterFields = ({
  sort,
  ascentType,
  onSortChange,
  onAscentTypeChange
}: Props) => {
  const { t } = useLingui();

  return (
    <FieldsStyled>
      <TextField
        select
        fullWidth
        size="small"
        label={t`Sort by`}
        value={sort}
        onChange={(event) => onSortChange(event.target.value as TickSort)}
      >
        <MenuItem value="grade">
          <Trans>Grade</Trans>
        </MenuItem>
        <MenuItem value="date">
          <Trans>Date</Trans>
        </MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        size="small"
        label={t`Ascent type`}
        value={ascentType}
        onChange={(event) =>
          onAscentTypeChange(event.target.value as AscentFilter)
        }
      >
        <MenuItem value="all">
          <Trans>All styles</Trans>
        </MenuItem>
        {ASCENT_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            <AscentTypeLabel ascentType={type} />
          </MenuItem>
        ))}
      </TextField>
    </FieldsStyled>
  );
};

const FieldsStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: ${({ theme }) => theme.spacing(28)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
