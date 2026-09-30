import {
  type PropsWithChildren,
  type PointerEvent as ReactPointerEvent,
  useEffect,
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
import { photoFit, photoStage } from '@web/shared/theme/photoFrame';
import { ZoomStageShell } from '@web/shared/ui';

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
  label: string;
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
  label,
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
  const [isPhotoLoaded, setIsPhotoLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [menu, setMenu] = useState<{
    index: number;
    top: number;
    left: number;
  }>();
  const overlayRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);
  const pointerRef = useRef<{ clientX: number; clientY: number } | undefined>(
    undefined
  );
  const lines = Object.values(topo.lines);

  useEffect(
    () => () => {
      if (frameRef.current !== undefined)
        cancelAnimationFrame(frameRef.current);
    },
    []
  );

  const selected = session.idSelectedRoute
    ? topo.lines[session.idSelectedRoute]
    : undefined;

  const isEditable = (idRoute: string) =>
    access.kind === 'sector' || idRoute === access.idRoute;

  const handleOverlayDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (session.isPreview || event.button !== 0 || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const point = pointerToPhoto(event, rect);
    const tolerance = toleranceOf(rect, LINE_TOLERANCE);

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
      lines.filter((line) => line.idRoute !== session.idSelectedRoute),
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
    if (session.isPreview || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const idRoute = findNearestLine(
      lines,
      pointerToPhoto(event, rect),
      toleranceOf(rect, LINE_TOLERANCE)
    );

    onHoverRoute(idRoute && isEditable(idRoute) ? idRoute : undefined);
  };

  /** One action per frame: the browser fires pointermove far more often than
      it paints, and both actions set an absolute position, so a move the
      frame never reached is simply overwritten by the next one. */
  const flushDrag = () => {
    frameRef.current = undefined;

    const drag = dragRef.current;
    const pointer = pointerRef.current;

    if (!drag || !pointer || !overlayRef.current) return;

    const point = pointerToPhoto(
      pointer,
      overlayRef.current.getBoundingClientRect()
    );

    if (drag.kind === 'point') {
      onAction({ type: 'MOVE_POINT', index: drag.index, point });

      return;
    }

    onAction({
      type: 'MOVE_LABEL',
      offset: [point[0] - drag.origin[0], point[1] - drag.origin[1]]
    });
  };

  const handleDragMove = (event: ReactPointerEvent) => {
    if (!dragRef.current) return;

    pointerRef.current = { clientX: event.clientX, clientY: event.clientY };

    if (frameRef.current === undefined) {
      frameRef.current = requestAnimationFrame(flushDrag);
    }
  };

  const endDrag = (): Drag | undefined => {
    if (frameRef.current !== undefined) {
      cancelAnimationFrame(frameRef.current);
      flushDrag();
    }

    const drag = dragRef.current;

    dragRef.current = undefined;
    pointerRef.current = undefined;

    if (drag) onGestureEnd();

    return drag;
  };

  const handleOverlayMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current) {
      handleDragMove(event);

      return;
    }

    handleOverlayHover(event);
  };

  const handleDragEnd = (event: ReactPointerEvent) => {
    const drag = endDrag();

    if (drag?.kind !== 'point') return;

    const travel = Math.hypot(
      event.clientX - drag.from.x,
      event.clientY - drag.from.y
    );

    if (travel <= CLICK_SLOP) {
      setMenu({ index: drag.index, top: event.clientY, left: event.clientX });
    }
  };

  /** The overlay holds the capture, never the marker or the badge that was
      pressed: those re-render through the drag, and a node that goes away
      takes the rest of the gesture with it. */
  const captureDrag = (event: ReactPointerEvent) => {
    overlayRef.current?.setPointerCapture(event.pointerId);
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
    captureDrag(event);
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
    captureDrag(event);
  };

  return (
    <ZoomStageShell className={className}>
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
          <StageStyled>
            <FrameStyled isPhotoLoaded={isPhotoLoaded}>
              <ImageStyled
                src={topo.photoUrl}
                alt={label}
                decoding="async"
                onLoad={() => setIsPhotoLoaded(true)}
              />
              <OverlayStyled
                ref={overlayRef}
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                isDrawing={!!session.idSelectedRoute && !session.isPreview}
                onPointerDown={handleOverlayDown}
                onPointerMove={handleOverlayMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                // The capture can be taken away mid-drag; without this the
                // gesture would stay open and the next hover would keep moving.
                onLostPointerCapture={() => endDrag()}
                onPointerLeave={() => {
                  if (!dragRef.current) onHoverRoute(undefined);
                }}
              >
                <title>{label}</title>
                <TopoEditOverlay
                  lines={lines}
                  idSelectedRoute={session.idSelectedRoute}
                  idHoveredRoute={idHoveredRoute}
                  colorOf={colorOf}
                />
              </OverlayStyled>
              <TopoEditMarkers
                lines={lines}
                idSelectedRoute={session.idSelectedRoute}
                idHoveredRoute={idHoveredRoute}
                idSelectedPoint={session.idSelectedPoint}
                areHandlesHidden={session.isPreview}
                colorOf={colorOf}
                onPointDown={handlePointDown}
              />
              {lines.map((line) => {
                const number = numberOf[line.idRoute];
                const [start] = line.points;

                return number && start ? (
                  <BadgeSlotStyled
                    key={line.idRoute}
                    onPointerDown={(event) =>
                      handleLabelDown(line.idRoute, start, event)
                    }
                  >
                    <TopoRouteBadge
                      number={number}
                      grade={gradeOf(line.idRoute)}
                      gradeScale={gradeScaleOf(line.idRoute)}
                      name={
                        lines.length === 1 ||
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
          </StageStyled>
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
    </ZoomStageShell>
  );
};

const FALLBACK_RATIO = '4 / 3';

const StageStyled = styled('div')`
  ${photoStage()}
`;

const FrameStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isPhotoLoaded'
})<{ isPhotoLoaded: boolean }>`
  position: relative;
  display: inline-flex;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: ${({ isPhotoLoaded }) => (isPhotoLoaded ? 'auto' : FALLBACK_RATIO)};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ImageStyled = styled('img')`
  ${({ theme }) => photoFit(theme)}
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
