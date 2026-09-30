import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import TuneIcon from '@mui/icons-material/Tune';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import { BottomSheet } from '@web/shared/ui';

import type { RouteSort } from '../common';
import { ROUTE_SORTS, useRouteSortLabel } from '../common';

export interface Props {
  sort: RouteSort;
  onSortChange: (sort: RouteSort) => void;
}

export const RoutesSortButton = ({ sort, onSortChange }: Props) => {
  const { t } = useLingui();
  const sortLabel = useRouteSortLabel();
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (next: RouteSort) => {
    onSortChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={t`Sort routes`}
        onClick={() => setIsOpen(true)}
      >
        <Badge color="primary" variant="dot" invisible={sort === 'default'}>
          <TuneIcon />
        </Badge>
      </IconButton>
      <BottomSheet
        title={t`Sort routes`}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <MenuList>
          {ROUTE_SORTS.map((one) => (
            <MenuItem
              key={one}
              selected={one === sort}
              onClick={() => handleSortChange(one)}
            >
              {sortLabel(one)}
            </MenuItem>
          ))}
        </MenuList>
      </BottomSheet>
    </>
  );
};
