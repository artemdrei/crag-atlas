import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { ModalAnchor } from '@web/app/providers';

import type { Tick } from '../common';
import { useTickMenu, useTickMenuItems } from '../common';

export interface Props {
  open: boolean;
  tick: Tick;
  anchor?: ModalAnchor;
}

const TickMenu = ({ open, tick, anchor }: Props) => {
  const { close, edit, remove } = useTickMenu(tick);
  const items = useTickMenuItems({ onEdit: edit, onDelete: remove });

  return (
    <Menu
      open={open}
      anchorReference="anchorPosition"
      anchorPosition={anchor}
      onClose={close}
    >
      {items.map(({ id, label, icon, onSelect }) => (
        <MenuItem key={id} onClick={onSelect}>
          <ListItemIcon>{icon}</ListItemIcon>
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default TickMenu;
