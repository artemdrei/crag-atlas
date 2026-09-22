import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { ModalAnchor } from '@web/app/providers';

import { useRouteCommentMenu, useRouteCommentMenuItems } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idComment: string;
  body: string;
  canEdit: boolean;
  canDelete: boolean;
  anchor?: ModalAnchor;
}

const RouteCommentMenu = ({
  open,
  idRoute,
  idComment,
  body,
  canEdit,
  canDelete,
  anchor
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

export default RouteCommentMenu;
