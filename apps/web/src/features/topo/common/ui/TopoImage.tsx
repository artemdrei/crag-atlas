import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState
} from 'react';

import type { RouteLine } from '@crag-atlas/api';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

import { photoFit, photoStage } from '@web/shared/theme/photoFrame';

import {
  findNearestLine,
  lineOpacity,
  pointerToPhoto,
  smoothPath,
  toleranceOf,
  toPairs
} from '../lib';
import { TopoPointMark } from './TopoPointMark';
import { TopoRouteBadge } from './TopoRouteBadge';

export interface Props {
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  idHighlightedRoute?: string;
  colorOf?: (idRoute: string) => string | undefined;
  numberOf?: Record<string, number>;
  isTopAligned?: boolean;
  onSelectRoute?: (idRoute: string) => void;
  onSelectPhoto?: () => void;
  onHoverRoute?: (idRoute?: string) => void;
}

export const TopoImage = ({
  photoUrl,
  label,
  lines,
  idHighlightedRoute,
  colorOf,
  numberOf,
  onSelectRoute,
  onSelectPhoto,
  onHoverRoute,
  isTopAligned
}: Props) => {
  const [loadedUrl, setLoadedUrl] = useState<string>();
  const overlayRef = useRef<SVGSVGElement>(null);
  const pressedAt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isLoaded = loadedUrl === photoUrl;

  const hasHighlight = lines.some(
    (line) => line.idRoute === idHighlightedRoute
  );

  // Hovering changes opacity, not geometry: without this every hover re-runs
  // the spline for every line on the photo.
  const shapes = useMemo(
    () =>
      lines.map((line) => ({
        line,
        path: smoothPath(line.points),
        bolts: toPairs(line.bolts),
        anchor: line.anchor ? toPairs([line.anchor])[0] : undefined,
        start: toPairs(line.points)[0]
      })),
    [lines]
  );

  return (
    <StageStyled isTopAligned={!!isTopAligned}>
      {!isLoaded && (
        <LoaderStyled>
          <CircularProgress size={28} />
        </LoaderStyled>
      )}
      <FrameStyled>
        <ImageStyled
          src={photoUrl}
          alt={label}
          decoding="async"
          isLoaded={isLoaded}
          onLoad={({ currentTarget }) => setLoadedUrl(currentTarget.src)}
        />
        <OverlayStyled
          ref={overlayRef}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          isLoaded={isLoaded}
          isHoverable={!!onHoverRoute || !!onSelectRoute || !!onSelectPhoto}
          onPointerDown={(event: ReactPointerEvent<SVGSVGElement>) => {
            pressedAt.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event: ReactPointerEvent<SVGSVGElement>) => {
            if (!onHoverRoute || !overlayRef.current) return;

            const rect = overlayRef.current.getBoundingClientRect();

            onHoverRoute(
              findNearestLine(
                lines,
                pointerToPhoto(event, rect),
                toleranceOf(rect, HOVER_TOLERANCE)
              )
            );
          }}
          onPointerLeave={() => onHoverRoute?.(undefined)}
          onClick={(event: ReactPointerEvent<SVGSVGElement>) => {
            if ((!onSelectRoute && !onSelectPhoto) || !overlayRef.current)
              return;

            const travel = Math.hypot(
              event.clientX - pressedAt.current.x,
              event.clientY - pressedAt.current.y
            );

            if (travel > TAP_SLOP) return;

            const rect = overlayRef.current.getBoundingClientRect();
            const idRoute = findNearestLine(
              lines,
              pointerToPhoto(event, rect),
              toleranceOf(rect, HOVER_TOLERANCE)
            );

            if (idRoute && onSelectRoute) onSelectRoute(idRoute);
            else onSelectPhoto?.();
          }}
        >
          <title>{label}</title>
          {shapes.map(({ line, path }) => {
            const isHighlighted = idHighlightedRoute === line.idRoute;

            return (
              <PathStyled
                key={line.idRoute}
                d={path}
                lineColor={colorOf?.(line.idRoute)}
                isHighlighted={isHighlighted}
                lineAlpha={lineOpacity(isHighlighted, hasHighlight)}
              />
            );
          })}
        </OverlayStyled>
        {isLoaded &&
          shapes.flatMap(({ line, bolts, anchor }) => {
            const lineColor = colorOf?.(line.idRoute);
            const alpha = lineOpacity(
              idHighlightedRoute === line.idRoute,
              hasHighlight
            );

            return [
              ...bolts.map(([x, y]) => (
                <TopoPointMark
                  key={`bolt-${line.idRoute}-${x}-${y}`}
                  kind="bolt"
                  x={x}
                  y={y}
                  color={lineColor}
                  opacity={alpha}
                />
              )),
              ...(anchor
                ? [
                    <TopoPointMark
                      key={`anchor-${line.idRoute}`}
                      kind="anchor"
                      x={anchor[0]}
                      y={anchor[1]}
                      color={lineColor}
                      opacity={alpha}
                    />
                  ]
                : [])
            ];
          })}
        {isLoaded &&
          numberOf &&
          shapes.map(({ line, start }) => {
            const number = numberOf[line.idRoute];

            return number && start ? (
              <TopoRouteBadge
                key={line.idRoute}
                number={number}
                grade={line.grade}
                gradeScale={line.gradeScale}
                name={
                  lines.length === 1 || idHighlightedRoute === line.idRoute
                    ? line.routeName
                    : undefined
                }
                x={start[0] + line.labelOffsetX}
                y={start[1] + line.labelOffsetY}
                isDimmed={hasHighlight && idHighlightedRoute !== line.idRoute}
                onSelect={
                  onSelectRoute ? () => onSelectRoute(line.idRoute) : undefined
                }
                onHover={(isOver) =>
                  onHoverRoute?.(isOver ? line.idRoute : undefined)
                }
              />
            ) : null;
          })}
      </FrameStyled>
    </StageStyled>
  );
};

const HOVER_TOLERANCE = 16;

const TAP_SLOP = 4;

const StageStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isTopAligned'
})<{ isTopAligned: boolean }>`
  ${({ isTopAligned }) => photoStage(isTopAligned ? 'flex-start' : 'center')}
`;

const FrameStyled = styled('div')`
  position: relative;
  display: flex;
  max-width: 100%;
  max-height: 100%;
`;

const ImageStyled = styled('img', {
  shouldForwardProp: (prop) => prop !== 'isLoaded'
})<{ isLoaded: boolean }>`
  ${({ theme }) => photoFit(theme)}
  opacity: ${({ isLoaded }) => (isLoaded ? 1 : 0)};
  transition: opacity 0.2s ease-out;
`;

const LoaderStyled = styled('div')`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OverlayStyled = styled('svg', {
  shouldForwardProp: (prop) => prop !== 'isLoaded' && prop !== 'isHoverable'
})<{ isLoaded: boolean; isHoverable: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ isLoaded }) => (isLoaded ? 1 : 0)};
  pointer-events: ${({ isHoverable }) => (isHoverable ? 'auto' : 'none')};
  transition: opacity 0.2s ease-out;
`;

const PathStyled = styled('path', {
  shouldForwardProp: (prop) =>
    prop !== 'lineAlpha' && prop !== 'isHighlighted' && prop !== 'lineColor'
})<{ lineAlpha: number; isHighlighted: boolean; lineColor?: string }>`
  fill: none;
  stroke: ${({ theme, lineColor }) =>
    lineColor ?? theme.palette.secondary.main};
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
  /* non-scaling-stroke measures in px, so the stretched viewBox cannot squash
     the line. */
  stroke-width: ${({ isHighlighted }) => (isHighlighted ? 4 : 3)};
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: ${({ lineAlpha }) => lineAlpha};
  vector-effect: non-scaling-stroke;
`;
