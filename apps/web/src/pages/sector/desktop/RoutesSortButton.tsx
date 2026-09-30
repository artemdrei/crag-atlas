import { useRef, useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import TuneIcon from '@mui/icons-material/Tune';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { RouteSort } from '../common';
import { ROUTE_SORTS, useRouteSortLabel } from '../common';

export interface Props {
  sort: RouteSort;
  onSortChange: (sort: RouteSort) => void;
}

export const RoutesSortButton = ({ sort, onSortChange }: Props) => {
  const { t } = useLingui();
  const sortLabel = useRouteSortLabel();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (next: RouteSort) => {
    onSortChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        size="small"
        aria-label={t`Sort routes`}
        onClick={() => setIsOpen(true)}
      >
        <Badge color="primary" variant="dot" invisible={sort === 'default'}>
          <TuneIcon />
        </Badge>
      </IconButton>
      <Menu
        open={isOpen}
        anchorEl={buttonRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setIsOpen(false)}
      >
        {ROUTE_SORTS.map((one) => (
          <MenuItem
            key={one}
            selected={one === sort}
            onClick={() => handleSortChange(one)}
          >
            {sortLabel(one)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
