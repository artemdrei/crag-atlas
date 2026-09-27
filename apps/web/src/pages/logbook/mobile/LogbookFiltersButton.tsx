import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import FilterListIcon from '@mui/icons-material/FilterList';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';

import { BottomSheet } from '@web/shared/ui';

import type { AscentFilter, TickSort } from '../common';
import { LogbookFilterFields } from '../common';

export interface Props {
  sort: TickSort;
  ascentType: AscentFilter;
  onSortChange: (sort: TickSort) => void;
  onAscentTypeChange: (ascentType: AscentFilter) => void;
}

export const LogbookFiltersButton = ({
  sort,
  ascentType,
  onSortChange,
  onAscentTypeChange
}: Props) => {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton aria-label={t`Filters`} onClick={() => setIsOpen(true)}>
        <Badge color="primary" variant="dot" invisible={ascentType === 'all'}>
          <FilterListIcon />
        </Badge>
      </IconButton>
      <BottomSheet
        title={t`Filters`}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <LogbookFilterFields
          sort={sort}
          ascentType={ascentType}
          onSortChange={onSortChange}
          onAscentTypeChange={onAscentTypeChange}
        />
      </BottomSheet>
    </>
  );
};
