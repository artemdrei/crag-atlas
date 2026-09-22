import {
  type PropsWithChildren,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState
} from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import type { GradeScale } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import {
  findNearestLine,
  findNearestSegment,
  pointerToPhoto,
  TopoRouteBadge,
  TopoZoomControls,
  toleranceOf
} from '@web/features/topo';

import type {
  EditableTopo,
  EditorAction,
  Point,
  TopoEditorSession
} from '../../common';
import { HANDLE_CLASS, TopoEditMarkers } from './TopoEditMarkers';
import { TopoEditOverlay } from './TopoEditOverlay';
import { TopoPointMenu } from './TopoPointMenu';

/** A sector editor reaches every line on the photo; an editor scoped to one
    route leaves the rest visible but untouchable. */
export type StageAccess =
  | { kind: 'sector' }
  | { kind: 'route'; idRoute: string };

export interface Props {
  topo: EditableTopo;
  session: TopoEditorSession;
  idHoveredRoute?: string;
  access: StageAccess;
  numberOf: Record<string, number>;
  colorOf: (idRoute: string) => string | undefined;
  gradeOf: (idRoute: string) => string;
  gradeScaleOf: (idRoute: string) => GradeScale;
  nameOf: (idRoute: string) => string;
  onAction: (action: EditorAction) => void;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onHoverRoute: (idRoute?: string) => void;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const LINE_TOLERANCE = 16;
/** Past this the pointer was dragging a point, not clicking it. */
const CLICK_SLOP = 4;

type Drag =
  | { kind: 'point'; index: number; from: { x: number; y: number } }
  | { kind: 'label'; origin: Point };

export const TopoEditStage = ({
  topo,
  session,
  idHoveredRoute,
  access,
  numberOf,
  colorOf,
  gradeOf,
  gradeScaleOf,
  nameOf,
  onAction,
  onGestureStart,
  onGestureEnd,
  onHoverRoute,
  className,
  children
}: PropsWithChildren<Props>) => {
  const [ratio, setRatio] = useState<number>();
  const [isZoomed, setIsZoomed] = useState(false);
  const [menu, setMenu] = useState<{
    index: number;
    top: number;
    left: number;
  }>();
  const overlayRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | undefined>(undefined);

  const selected = session.idSelectedRoute
    ? topo.lines[session.idSelectedRoute]
    : undefined;

  const isEditable = (idRoute: string) =>
    access.kind === 'sector' || idRoute === access.idRoute;

  const handleOverlayDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (session.isPreview || event.button !== 0 || !overlayRef.current) return;

    const point = pointerToPhoto(event, overlayRef.current);
    const tolerance = toleranceOf(overlayRef.current, LINE_TOLERANCE);

    if (selected && selected.points.length >= 2) {
      const hit = findNearestSegment(selected.points, point, tolerance);

      if (hit) {
        onAction({
          type: 'INSERT_POINT',
          index: hit.index + 1,
          point: hit.projection
        });

        return;
      }
    }

    const idRoute = findNearestLine(
      Object.values(topo.lines).filter(
        (line) => line.idRoute !== session.idSelectedRoute
      ),
      point,
      tolerance
    );

    // Locked to one route, a hit on someone else's line is neither a pick nor
    // a place to draw: the click lands on a line the user cannot touch.
    if (idRoute) {
      if (isEditable(idRoute)) onAction({ type: 'SELECT_ROUTE', idRoute });

      return;
    }

    if (session.idSelectedRoute) onAction({ type: 'APPEND_POINT', point });
  };

  const handleOverlayHover = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current || session.isPreview || !overlayRef.current) return;

    const point = pointerToPhoto(event, overlayRef.current);
    const idRoute = findNearestLine(
      Object.values(topo.lines),
      point,
      toleranceOf(overlayRef.current, LINE_TOLERANCE)
    );

    onHoverRoute(idRoute && isEditable(idRoute) ? idRoute : undefined);
  };

  const handleDragMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;

    if (!drag || !overlayRef.current) return;

    const point = pointerToPhoto(event, overlayRef.current);

    if (drag.kind === 'point') {
      onAction({ type: 'MOVE_POINT', index: drag.index, point });

      return;
    }

    onAction({
      type: 'MOVE_LABEL',
      offset: [point[0] - drag.origin[0], point[1] - drag.origin[1]]
    });
  };

  const handleDragEnd = (event: ReactPointerEvent) => {
    const drag = dragRef.current;

    dragRef.current = undefined;
    onGestureEnd();

    if (drag?.kind !== 'point') return;

    const travel = Math.hypot(
      event.clientX - drag.from.x,
      event.clientY - drag.from.y
    );

    if (travel <= CLICK_SLOP) {
      setMenu({ index: drag.index, top: event.clientY, left: event.clientX });
    }
  };

  const handlePointDown = (index: number, event: ReactPointerEvent) => {
    event.stopPropagation();
    onGestureStart();
    dragRef.current = {
      kind: 'point',
      index,
      from: { x: event.clientX, y: event.clientY }
    };
    onAction({ type: 'SELECT_POINT', index });
    // On the marker itself, so the drag survives it re-rendering mid-move.
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleLabelDown = (
    idRoute: string,
    origin: Point,
    event: ReactPointerEvent
  ) => {
    if (session.isPreview || !isEditable(idRoute)) return;

    event.stopPropagation();
    onAction({ type: 'SELECT_ROUTE', idRoute });
    onGestureStart();
    dragRef.current = { kind: 'label', origin };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <StageStyled className={className}>
      <TransformWrapper
        key={topo.id}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        centerOnInit
        wheel={{ wheelDisabled: true }}
        // Left draws, middle pans — no mode switch to reposition the photo.
        panning={{
          allowLeftClickPan: session.isPreview,
          allowMiddleClickPan: true,
          excluded: [HANDLE_CLASS]
        }}
        trackPadPanning={{ disabled: !isZoomed }}
        // Two quick point-adds must not toggle the zoom under the cursor.
        doubleClick={{ disabled: true }}
        keyboard={{ disabled: true }}
        onTransform={(_ref, state) => setIsZoomed(state.scale > MIN_SCALE)}
      >
        <TransformComponent>
          <FrameStyled ratio={ratio}>
            <ImageStyled
              src={topo.photoUrl}
              alt={topo.label}
              decoding="async"
              onLoad={({ currentTarget }) =>
                setRatio(
                  currentTarget.naturalWidth / currentTarget.naturalHeight
                )
              }
            />
            <OverlayStyled
              ref={overlayRef}
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              isDrawing={!!session.idSelectedRoute && !session.isPreview}
              onPointerDown={handleOverlayDown}
              onPointerMove={handleOverlayHover}
              onPointerLeave={() => onHoverRoute(undefined)}
            >
              <title>{topo.label}</title>
              <TopoEditOverlay
                lines={Object.values(topo.lines)}
                idSelectedRoute={session.idSelectedRoute}
                idHoveredRoute={idHoveredRoute}
                colorOf={colorOf}
              />
            </OverlayStyled>
            <TopoEditMarkers
              lines={Object.values(topo.lines)}
              idSelectedRoute={session.idSelectedRoute}
              idHoveredRoute={idHoveredRoute}
              idSelectedPoint={session.idSelectedPoint}
              areHandlesHidden={session.isPreview}
              colorOf={colorOf}
              onPointDown={handlePointDown}
              onPointMove={handleDragMove}
              onPointUp={handleDragEnd}
            />
            {Object.values(topo.lines).map((line) => {
              const number = numberOf[line.idRoute];
              const [start] = line.points;

              return number && start ? (
                <BadgeSlotStyled
                  key={line.idRoute}
                  onPointerDown={(event) =>
                    handleLabelDown(line.idRoute, start, event)
                  }
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                >
                  <TopoRouteBadge
                    number={number}
                    grade={gradeOf(line.idRoute)}
                    gradeScale={gradeScaleOf(line.idRoute)}
                    name={
                      Object.keys(topo.lines).length === 1 ||
                      line.idRoute === session.idSelectedRoute ||
                      line.idRoute === idHoveredRoute
                        ? nameOf(line.idRoute)
                        : undefined
                    }
                    x={start[0] + line.labelOffset[0]}
                    y={start[1] + line.labelOffset[1]}
                    isHighlighted={line.idRoute === session.idSelectedRoute}
                    isDimmed={
                      !!session.idSelectedRoute &&
                      line.idRoute !== session.idSelectedRoute
                    }
                    onSelect={
                      isEditable(line.idRoute)
                        ? () =>
                            onAction({
                              type: 'SELECT_ROUTE',
                              idRoute: line.idRoute
                            })
                        : undefined
                    }
                    onHover={(isOver) =>
                      onHoverRoute(
                        isOver && isEditable(line.idRoute)
                          ? line.idRoute
                          : undefined
                      )
                    }
                  />
                </BadgeSlotStyled>
              ) : null;
            })}
          </FrameStyled>
        </TransformComponent>
        <TopoZoomControls />
        {children}
      </TransformWrapper>
      {menu && selected && (
        <TopoPointMenu
          kind={selected.kinds[menu.index] ?? 'plain'}
          position={{ top: menu.top, left: menu.left }}
          canDelete={menu.index > 0 && menu.index < selected.points.length - 1}
          onSelectKind={(kind) => {
            onAction({ type: 'SET_POINT_KIND', index: menu.index, kind });
            setMenu(undefined);
          }}
          onDelete={() => {
            onAction({ type: 'DELETE_POINT', index: menu.index });
            setMenu(undefined);
          }}
          onClose={() => setMenu(undefined)}
        />
      )}
    </StageStyled>
  );
};

const FALLBACK_RATIO = '4 / 3';

const StageStyled = styled('div')`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  & .react-transform-wrapper,
  & .react-transform-component {
    width: 100%;
    height: 100%;
  }

  & .react-transform-component {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const FrameStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'ratio'
})<{ ratio?: number }>`
  position: relative;
  display: inline-flex;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: ${({ ratio }) => (ratio ? 'auto' : FALLBACK_RATIO)};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ImageStyled = styled('img')`
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
`;

const OverlayStyled = styled('svg', {
  shouldForwardProp: (prop) => prop !== 'isDrawing'
})<{ isDrawing: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: ${({ isDrawing }) => (isDrawing ? 'crosshair' : 'default')};
  /* The browser's own gestures would fight every drag otherwise. */
  touch-action: none;
`;

const BadgeSlotStyled = styled('div')`
  position: absolute;
  inset: 0;
  pointer-events: none;

  & > * {
    pointer-events: auto;
    touch-action: none;
  }
`;
