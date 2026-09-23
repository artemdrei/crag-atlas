import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { BottomSheet } from '@web/shared/ui';

import type { Tick } from '../common';
import { useTickMenu, useTickMenuItems } from '../common';

export interface Props {
  open: boolean;
  tick: Tick;
}

const TickMenuSheet = ({ open, tick }: Props) => {
  const { close, edit, remove } = useTickMenu(tick);
  const items = useTickMenuItems({ onEdit: edit, onDelete: remove });

  return (
    <BottomSheet isOpen={open} onClose={close}>
      <List>
        {items.map(({ id, label, icon, onSelect }) => (
          <ListItemButton key={id} onClick={onSelect}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </BottomSheet>
  );
};

export default TickMenuSheet;
