import { Trans } from '@lingui/react/macro';
import AnchorIcon from '@mui/icons-material/Anchor';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ListItemIcon from '@mui/material/ListItemIcon';
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
    <MenuItem
      selected={kind === 'anchor'}
      onClick={() => onSelectKind('anchor')}
    >
      <ListItemIcon>
        <AnchorIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        <Trans>Anchor</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem selected={kind === 'bolt'} onClick={() => onSelectKind('bolt')}>
      <ListItemIcon>
        <RadioButtonCheckedIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        <Trans>Bolt</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem selected={kind === 'plain'} onClick={() => onSelectKind('plain')}>
      <ListItemIcon>
        <FiberManualRecordIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        <Trans>Plain point</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem disabled={!canDelete} onClick={onDelete}>
      <ListItemIcon>
        <DeleteOutlinedIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        <Trans>Delete point</Trans>
      </ListItemText>
    </MenuItem>
  </Menu>
);
