import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeTone } from '@web/shared/theme/palette';
import { UnsavedBadge } from '@web/shared/ui';

import type { RouteDraft } from '../../common';
import type { RouteGroupDraft } from '../TopoEditorDesktop';

export interface Props {
  groups: RouteGroupDraft[];
  numberOf: Record<string, number>;
  /** Fields or geometry away from what the server holds. */
  idsDirtyRoutes: ReadonlySet<string>;
  idSelectedRoute?: string;
  idHoveredRoute?: string;
  isBusy: boolean;
  onSelect: (idRoute: string) => void;
  onHover: (idRoute?: string) => void;
  onMoveToPhoto: (idRoute: string, idTopo: string) => void;
  onAdd: () => void;
}

/** Below this the pointer is clicking the row, not dragging it. */
const DRAG_THRESHOLD = 6;

export const TopoEditorRouteList = ({
  groups,
  numberOf,
  idsDirtyRoutes,
  idSelectedRoute,
  idHoveredRoute,
  isBusy,
  onSelect,
  onHover,
  onMoveToPhoto,
  onAdd
}: Props) => {
  const { t } = useLingui();
  const [idDragged, setIdDragged] = useState<string>();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_THRESHOLD }
    }),
    useSensor(KeyboardSensor)
  );

  const routes = groups.flatMap((group) => group.routes);

  const dragged = routes.find((route) => route.id === idDragged);

  const nameOf = (id: string | number) =>
    routes.find((route) => route.id === String(id))?.name ||
    groups.find((group) => group.id === String(id))?.label ||
    String(id);

  // A drop on the photo the line already hangs on, or on the group that is no
  // photo at all, leaves the session as it is — the reducer says so, not this.
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setIdDragged(undefined);

    if (over) onMoveToPhoto(String(active.id), String(over.id));
  };

  const rowContent = (route: RouteDraft) => (
    <>
      <NumberStyled tone={resolveGradeTone(route.grade, route.gradeScale)}>
        {numberOf[route.id] ?? '—'}
      </NumberStyled>
      <NameStyled variant="body2" noWrap>
        {route.name}
      </NameStyled>
      {idsDirtyRoutes.has(route.id) && <UnsavedBadge />}
      <Typography variant="body2" color="text.secondary">
        {route.grade}
      </Typography>
    </>
  );

  const renderRow = (route: RouteDraft) => (
    <DraggableRow
      key={route.id}
      route={route}
      isSelected={route.id === idSelectedRoute}
      isHovered={route.id === idHoveredRoute}
      isDirty={idsDirtyRoutes.has(route.id)}
      onSelect={onSelect}
      onHover={onHover}
    >
      {rowContent(route)}
    </DraggableRow>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => t`Picked up ${nameOf(active.id)}`,
          onDragOver: ({ over }) =>
            over ? t`Now over ${nameOf(over.id)}` : '',
          onDragEnd: ({ over }) =>
            over ? t`Moved to ${nameOf(over.id)}` : t`Drag cancelled`,
          onDragCancel: () => t`Drag cancelled`
        }
      }}
      onDragStart={({ active }: DragStartEvent) =>
        setIdDragged(String(active.id))
      }
      onDragEnd={handleDragEnd}
      onDragCancel={() => setIdDragged(undefined)}
    >
      <ListStyled>
        <HeaderStyled>
          <Typography variant="subtitle2">
            <Trans>Routes</Trans>
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon fontSize="small" />}
            disabled={isBusy}
            onClick={onAdd}
          >
            <Trans>Add</Trans>
          </Button>
        </HeaderStyled>
        {routes.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            <Trans>
              No routes yet — add the first one, then drag it onto the photo it
              is drawn on.
            </Trans>
          </Typography>
        )}
        {groups.map((group) => (
          <DroppableGroup key={group.id} id={group.id} label={group.label}>
            {/* A photo with nothing on it is a drop zone and looks like a gap;
                the hint is what says so. With no route anywhere there is
                nothing to drag, and the list-wide hint covers it instead. */}
            {group.routes.length === 0 && routes.length > 0 ? (
              <DropHintStyled variant="caption" color="text.secondary">
                <Trans>Drag a route here</Trans>
              </DropHintStyled>
            ) : (
              group.routes.map(renderRow)
            )}
          </DroppableGroup>
        ))}
      </ListStyled>
      <DragOverlay>
        {dragged && (
          <OverlayRowStyled isSelected isHovered={false} isDirty={false}>
            {rowContent(dragged)}
          </OverlayRowStyled>
        )}
      </DragOverlay>
    </DndContext>
  );
};

interface DraggableRowProps extends PropsWithChildren {
  route: RouteDraft;
  isSelected: boolean;
  isHovered: boolean;
  isDirty: boolean;
  onSelect: (idRoute: string) => void;
  onHover: (idRoute?: string) => void;
}

const DraggableRow = ({
  route,
  isSelected,
  isHovered,
  isDirty,
  onSelect,
  onHover,
  children
}: DraggableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: route.id });

  return (
    <RowStyled
      ref={setNodeRef}
      isSelected={isSelected}
      isHovered={isHovered}
      isDirty={isDirty}
      isDragging={isDragging}
      style={{ transform: CSS.Translate.toString(transform) }}
      onClick={() => onSelect(route.id)}
      onMouseEnter={() => onHover(route.id)}
      onMouseLeave={() => onHover(undefined)}
      {...attributes}
      {...listeners}
    >
      {children}
    </RowStyled>
  );
};

interface DroppableGroupProps extends PropsWithChildren {
  id: string;
  label: string;
}

const DroppableGroup = ({ id, label, children }: DroppableGroupProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <GroupStyled ref={setNodeRef} isOver={isOver}>
      <GroupLabelStyled variant="caption" color="text.secondary">
        {label}
      </GroupLabelStyled>
      {children}
    </GroupStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-height: 0;
  overflow-y: auto;
  /* An auto overflow clips at the padding box on both axes, and the drop
     outline is drawn outside the group — this is the room it needs. */
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const GroupStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOver'
})<{ isOver: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  /* An empty photo is a thin strip, so the drop area needs a floor. */
  min-height: ${({ theme }) => theme.spacing(5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  outline: 2px dashed
    ${({ theme, isOver }) =>
      isOver ? theme.palette.primary.main : 'transparent'};
  outline-offset: 2px;
  /* A tint the panel can carry, so the zone reads as "drop here" rather than
     just being framed. */
  background: ${({ theme, isOver }) =>
    isOver ? alpha(theme.palette.primary.main, 0.08) : 'transparent'};
  transition:
    outline-color 0.15s ease-out,
    background-color 0.15s ease-out;
`;

const GroupLabelStyled = styled(Typography)`
  padding: ${({ theme }) => theme.spacing(1, 0, 0.5)};
`;

const DropHintStyled = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  border: 1px dashed ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

// Unsaved wins over selected on the border: what the row says about the
// catalog matters more than which row the panel is showing.
const RowStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' &&
    prop !== 'isHovered' &&
    prop !== 'isDirty' &&
    prop !== 'isDragging'
})<{
  isSelected: boolean;
  isHovered: boolean;
  isDirty: boolean;
  isDragging?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border: 1px solid
    ${({ theme, isSelected, isDirty }) =>
      isDirty
        ? theme.palette.warning.main
        : isSelected
          ? theme.palette.primary.main
          : theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  position: relative;
  background: ${({ theme, isSelected, isHovered, isDirty }) =>
    isDirty
      ? alpha(theme.palette.warning.main, isSelected || isHovered ? 0.18 : 0.1)
      : isSelected || isHovered
        ? theme.palette.action.hover
        : 'transparent'};
`;

// DragOverlay sizes its wrapper to the rect the row was measured at, so the
// row only has to fill it — otherwise it shrinks to its content. The surface
// is opaque: the row travels over the list, and the rows beneath must not
// read through it.
const OverlayRowStyled = styled(RowStyled)`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.palette.background.paper};
`;

const NumberStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: GradeTone }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme, tone }) => theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
`;

const NameStyled = styled(Typography)`
  flex-grow: 1;
  min-width: 0;
  text-align: left;
`;
