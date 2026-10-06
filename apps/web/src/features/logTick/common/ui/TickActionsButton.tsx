import type { MouseEvent } from 'react';

import { useLingui } from '@lingui/react/macro';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';

import { useModal } from '@web/app/providers';

import type { Tick } from '../entities';

export interface Props {
  tick: Tick;
}

export const TickActionsButton = ({ tick }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) =>
    openModal('TICK_MENU', { tick }, { anchorEl: event.currentTarget });

  return (
    <IconButton aria-label={t`Ascent actions`} onClick={handleOpenMenu}>
      <MoreVertIcon />
    </IconButton>
  );
};
