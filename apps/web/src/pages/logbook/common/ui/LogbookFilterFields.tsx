import { Trans, useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

import { ASCENT_TYPES } from '@web/shared/types';
import { AscentTypeLabel, FilterTextField } from '@web/shared/ui';
import { type TickView, TickViewSelect } from '@web/widgets/tickList';

import {
  type AscentFilter,
  DEFAULT_ASCENT_FILTER,
  DEFAULT_TICK_SORT,
  type TickSort
} from '../entities';

export interface Props {
  sort: TickSort;
  ascentType: AscentFilter;
  view: TickView;
  onSortChange: (sort: TickSort) => void;
  onAscentTypeChange: (ascentType: AscentFilter) => void;
  onViewChange: (view: TickView) => void;
}

export const LogbookFilterFields = ({
  sort,
  ascentType,
  view,
  onSortChange,
  onAscentTypeChange,
  onViewChange
}: Props) => {
  const { t } = useLingui();

  return (
    <FieldsStyled>
      <FilterTextField
        select
        fullWidth
        size="small"
        label={t`Sort by`}
        isActive={sort !== DEFAULT_TICK_SORT}
        value={sort}
        onChange={(event) => onSortChange(event.target.value as TickSort)}
      >
        <MenuItem value="grade">
          <Trans>Grade</Trans>
        </MenuItem>
        <MenuItem value="date">
          <Trans>Date</Trans>
        </MenuItem>
      </FilterTextField>
      <FilterTextField
        select
        fullWidth
        size="small"
        label={t`Ascent type`}
        isActive={ascentType !== DEFAULT_ASCENT_FILTER}
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
      </FilterTextField>
      <TickViewSelect view={view} onChange={onViewChange} />
    </FieldsStyled>
  );
};

const FieldsStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1.5)};

  & > * {
    flex: 1 1 0;
    max-width: ${({ theme }) => theme.spacing(30)};
  }
`;
