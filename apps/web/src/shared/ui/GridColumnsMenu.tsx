import { useRef, useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { GridColumns } from '@web/shared/lib';
import { GRID_COLUMN_CHOICES } from '@web/shared/lib';

export interface Props {
  columns: GridColumns;
  onChange: (columns: GridColumns) => void;
}

export const GridColumnsMenu = ({ columns, onChange }: Props) => {
  const { t } = useLingui();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const pick = (next: GridColumns) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        ref={buttonRef}
        size="small"
        variant="outlined"
        color="inherit"
        aria-haspopup="menu"
        aria-label={t`Cards per row`}
        startIcon={<ViewModuleIcon fontSize="small" />}
        onClick={() => setIsOpen(true)}
      >
        {columns}
      </Button>
      <Menu
        open={isOpen}
        anchorEl={buttonRef.current}
        onClose={() => setIsOpen(false)}
      >
        {GRID_COLUMN_CHOICES.map((choice) => (
          <MenuItem
            key={choice}
            selected={choice === columns}
            onClick={() => pick(choice)}
          >
            {choice}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
