import { Trans } from '@lingui/react/macro';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import type { PointKind } from '../../common';

export interface Props {
  kind: PointKind;
  position: { top: number; left: number };
  canDelete: boolean;
  onSelectKind: (kind: PointKind) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const TopoPointMenu = ({
  kind,
  position,
  canDelete,
  onSelectKind,
  onDelete,
  onClose
}: Props) => (
  <Menu
    open
    anchorReference="anchorPosition"
    anchorPosition={position}
    onClose={onClose}
  >
    <MenuItem selected={kind === 'plain'} onClick={() => onSelectKind('plain')}>
      <ListItemText>
        <Trans>Plain point</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem selected={kind === 'bolt'} onClick={() => onSelectKind('bolt')}>
      <ListItemText>
        <Trans>Bolt</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem
      selected={kind === 'anchor'}
      onClick={() => onSelectKind('anchor')}
    >
      <ListItemText>
        <Trans>Anchor</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem disabled={!canDelete} onClick={onDelete}>
      <ListItemText>
        <Trans>Delete point</Trans>
      </ListItemText>
    </MenuItem>
  </Menu>
);
