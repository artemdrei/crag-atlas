import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trans, useLingui } from '@lingui/react/macro';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { EditableTopo } from '../../common';

export type ThumbMode =
  | { kind: 'browse' }
  | {
      kind: 'manage';
      onReplace: (idTopo: string) => void;
      onDelete: (idTopo: string) => void;
    };

export interface Props {
  topo: EditableTopo;
  label: string;
  mode: ThumbMode;
  isCover: boolean;
  isActive: boolean;
  isBusy: boolean;
  onSelect: (idTopo: string) => void;
}

export const TopoThumb = ({
  topo,
  label,
  mode,
  isCover,
  isActive,
  isBusy,
  onSelect
}: Props) => {
  const { t } = useLingui();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
    index,
    activeIndex,
    overIndex
  } = useSortable({ id: topo.id, disabled: isBusy || mode.kind === 'browse' });

  const isTarget = isSorting && index === overIndex && index !== activeIndex;
  const insertAt = !isTarget
    ? undefined
    : activeIndex > overIndex
      ? 'before'
      : 'after';

  return (
    <ThumbStyled
      ref={setNodeRef}
      isActive={isActive}
      isDragging={isDragging}
      isMuted={isSorting && !isDragging}
      isSortable={mode.kind === 'manage'}
      insertAt={insertAt}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onSelect(topo.id)}
      {...attributes}
      {...listeners}
    >
      <img src={topo.photoUrl} alt={label} />
      {isCover && (
        <CoverStyled variant="caption">
          <Trans>Cover</Trans>
        </CoverStyled>
      )}
      {mode.kind === 'manage' && (
        <ActionsStyled>
          <Tooltip title={t`Replace photo`}>
            <span>
              <IconButton
                size="small"
                aria-label={t`Replace photo`}
                disabled={isBusy}
                onClick={(event) => {
                  event.stopPropagation();
                  mode.onReplace(topo.id);
                }}
              >
                <CameraswitchIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t`Delete photo`}>
            <span>
              <IconButton
                size="small"
                color="error"
                aria-label={t`Delete photo`}
                disabled={isBusy}
                onClick={(event) => {
                  event.stopPropagation();
                  mode.onDelete(topo.id);
                }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </ActionsStyled>
      )}
    </ThumbStyled>
  );
};

export const ThumbStyled = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'isActive' &&
    prop !== 'isDragging' &&
    prop !== 'isMuted' &&
    prop !== 'isSortable' &&
    prop !== 'insertAt'
})<{
  isActive: boolean;
  isDragging?: boolean;
  isMuted?: boolean;
  isSortable?: boolean;
  insertAt?: 'before' | 'after';
}>`
  position: relative;
  flex: 0 0 auto;
  width: 84px;
  height: 84px;
  overflow: hidden;
  background: ${({ theme }) => theme.palette.action.hover};
  cursor: ${({ isSortable }) => (isSortable === false ? 'pointer' : 'grab')};
  touch-action: none;
  border: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.palette.primary.main : theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  opacity: ${({ isDragging, isMuted }) => {
    if (isDragging) return 0.25;

    return isMuted ? 0.45 : 1;
  }};
  transition: opacity 0.15s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 2px;
    background: ${({ theme }) => theme.palette.primary.main};
    opacity: ${({ insertAt }) => (insertAt ? 1 : 0)};
    left: ${({ insertAt }) => (insertAt === 'before' ? '-6px' : 'auto')};
    right: ${({ insertAt }) => (insertAt === 'after' ? '-6px' : 'auto')};
  }

  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover > div:last-of-type {
    opacity: 1;
  }
`;

const ActionsStyled = styled('div')`
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.25)};
  background: rgb(0 0 0 / 55%);
  opacity: 0;
  transition: opacity 0.15s ease-out;

  /* The bar sits on its own dark scrim, so the icons cannot take the theme's
     colour: in light mode they vanished. */
  & .MuiIconButton-root {
    color: ${({ theme }) => theme.palette.common.white};
  }

  & .MuiIconButton-colorError {
    color: ${({ theme }) => theme.palette.error.light};
  }

  & .Mui-disabled {
    opacity: 0.4;
  }
`;

const CoverStyled = styled(Typography)`
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 ${({ theme }) => theme.spacing(0.5)};
  background: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
`;
