import { useRef, useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import FilterListIcon from '@mui/icons-material/FilterList';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton
        ref={buttonRef}
        aria-label={t`Filters`}
        onClick={() => setIsOpen(true)}
      >
        <Badge color="primary" variant="dot" invisible={ascentType === 'all'}>
          <FilterListIcon />
        </Badge>
      </IconButton>
      <Popover
        open={isOpen}
        anchorEl={buttonRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setIsOpen(false)}
      >
        <LogbookFilterFields
          sort={sort}
          ascentType={ascentType}
          onSortChange={onSortChange}
          onAscentTypeChange={onAscentTypeChange}
        />
      </Popover>
    </>
  );
};
