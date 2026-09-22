import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { BottomSheet } from '@web/shared/ui';

import { useRouteCommentMenu, useRouteCommentMenuItems } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idComment: string;
  body: string;
  canEdit: boolean;
  canDelete: boolean;
}

const RouteCommentMenuSheet = ({
  open,
  idRoute,
  idComment,
  body,
  canEdit,
  canDelete
}: Props) => {
  const { close, edit, remove } = useRouteCommentMenu({
    idRoute,
    idComment,
    body
  });
  const items = useRouteCommentMenuItems({
    canEdit,
    canDelete,
    onEdit: edit,
    onDelete: remove
  });

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

export default RouteCommentMenuSheet;
