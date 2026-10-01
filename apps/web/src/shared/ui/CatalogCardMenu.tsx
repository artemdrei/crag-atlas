import { useEffect, useRef, useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

// Long enough to cross the seam between the button and the list.
const CLOSE_DELAY_MS = 120;

export interface Props {
  label: string;
  onShowOnMap: () => void;
  onEdit?: () => void;
}

export const CatalogCardMenu = ({ label, onShowOnMap, onEdit }: Props) => {
  const { t } = useLingui();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const pick = (action: () => void) => () => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <ButtonStyled
        ref={buttonRef}
        size="small"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={open}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <MoreVertIcon fontSize="small" />
      </ButtonStyled>
      <MenuStyled
        open={isOpen}
        anchorEl={buttonRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ list: { onMouseEnter: open, onMouseLeave: close } }}
        disableAutoFocus
        disableRestoreFocus
        onClose={() => setIsOpen(false)}
      >
        <MenuItem onClick={pick(onShowOnMap)}>
          <ListItemIcon>
            <PlaceOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t`Show on map`}
        </MenuItem>
        {onEdit && (
          <MenuItem onClick={pick(onEdit)}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            {t`Edit`}
          </MenuItem>
        )}
      </MenuStyled>
    </>
  );
};

const ButtonStyled = styled(IconButton)`
  background-color: ${({ theme }) => theme.palette.background.paper};

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

// The backdrop would swallow every pointer event, so a hover-opened menu
// could never be left.
const MenuStyled = styled(Menu)`
  pointer-events: none;

  & .MuiPaper-root {
    pointer-events: auto;
  }
`;
