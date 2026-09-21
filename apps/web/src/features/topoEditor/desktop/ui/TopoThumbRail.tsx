import { useRef, useState } from 'react';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { EditableTopo } from '../../common';
import { ThumbStyled, TopoThumb } from './TopoThumb';

export interface Props {
  topos: EditableTopo[];
  idActiveTopo?: string;
  isBusy: boolean;
  onSelect: (idTopo: string) => void;
  onReorder: (idTopo: string, toIndex: number) => void;
  onReplace: (idTopo: string, file: File) => void;
  onAdd: (files: File[]) => void;
  onDelete: (idTopo: string) => void;
}

/** Below this the pointer is clicking the thumbnail, not dragging it. */
const DRAG_THRESHOLD = 6;

export const TopoThumbRail = ({
  topos,
  idActiveTopo,
  isBusy,
  onSelect,
  onReorder,
  onReplace,
  onAdd,
  onDelete
}: Props) => {
  const { t } = useLingui();
  const [idDragged, setIdDragged] = useState<string>();
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const idReplacing = useRef<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_THRESHOLD }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const dragged = topos.find(({ id }) => id === idDragged);

  // A uuid tells a screen-reader user nothing; the label does.
  const nameOf = (id: string | number) => {
    const index = topos.findIndex((topo) => topo.id === String(id));

    return topos[index]?.label || t`photo ${index + 1}`;
  };

  const handleDragStart = ({ active }: DragStartEvent) =>
    setIdDragged(String(active.id));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setIdDragged(undefined);

    if (!over || active.id === over.id) return;

    onReorder(
      String(active.id),
      topos.findIndex(({ id }) => id === over.id)
    );
  };

  const pick = (
    input: HTMLInputElement | null,
    use: (files: File[]) => void
  ) => {
    const files = Array.from(input?.files ?? []);

    if (files.length > 0) use(files);
    // Cleared, so picking the same file twice still fires a change event.
    if (input) input.value = '';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => t`Picked up ${nameOf(active.id)}`,
          onDragOver: ({ over }) =>
            over ? t`Now over ${nameOf(over.id)}` : '',
          onDragEnd: ({ over }) =>
            over ? t`Dropped on ${nameOf(over.id)}` : t`Drag cancelled`,
          onDragCancel: () => t`Drag cancelled`
        }
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setIdDragged(undefined)}
    >
      <RailStyled>
        <SortableContext
          items={topos.map(({ id }) => id)}
          strategy={horizontalListSortingStrategy}
        >
          {topos.map((topo, index) => (
            <TopoThumb
              key={topo.id}
              topo={topo}
              isCover={index === 0}
              isActive={topo.id === idActiveTopo}
              isBusy={isBusy}
              onSelect={onSelect}
              onReplace={(idTopo) => {
                idReplacing.current = idTopo;
                replaceRef.current?.click();
              }}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        <AddTileStyled
          type="button"
          disabled={isBusy}
          onClick={() => addRef.current?.click()}
        >
          <AddIcon fontSize="small" />
          <Typography variant="caption">
            <Trans>Add photo</Trans>
          </Typography>
        </AddTileStyled>
        <FileInputStyled
          ref={addRef}
          type="file"
          accept="image/*"
          multiple
          onChange={() => pick(addRef.current, onAdd)}
        />
        <FileInputStyled
          ref={replaceRef}
          type="file"
          accept="image/*"
          onChange={() =>
            pick(replaceRef.current, ([file]) =>
              onReplace(idReplacing.current, file)
            )
          }
        />
      </RailStyled>
      <DragOverlay>
        {dragged && (
          <ThumbStyled isActive>
            <img src={dragged.photoUrl} alt={dragged.label} />
          </ThumbStyled>
        )}
      </DragOverlay>
    </DndContext>
  );
};

const RailStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  /* Room for the insertion line, which the scroller would otherwise clip. */
  padding: 0 6px ${({ theme }) => theme.spacing(0.5)};
  overflow-x: auto;
`;

const AddTileStyled = styled('button')`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  width: 84px;
  height: 84px;
  cursor: pointer;
  border: 2px dashed ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: none;
  color: ${({ theme }) => theme.palette.text.secondary};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const FileInputStyled = styled('input')`
  display: none;
`;
