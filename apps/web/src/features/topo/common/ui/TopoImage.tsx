import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState
} from 'react';

import type { RouteLine } from '@crag-atlas/api';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

import {
  findNearestLine,
  lineOpacity,
  pointerToPhoto,
  smoothPath,
  toleranceOf
} from '../lib';
import { TopoPointMark } from './TopoPointMark';
import { TopoRouteBadge } from './TopoRouteBadge';

export interface Props {
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  idHighlightedRoute?: string;
  isContained?: boolean;
  colorOf?: (idRoute: string) => string | undefined;
  numberOf?: Record<string, number>;
  onSelectRoute?: (idRoute: string) => void;
  onHoverRoute?: (idRoute?: string) => void;
}

export const TopoImage = ({
  photoUrl,
  label,
  lines,
  idHighlightedRoute,
  isContained,
  colorOf,
  numberOf,
  onSelectRoute,
  onHoverRoute
}: Props) => {
  const [loadedPhoto, setLoadedPhoto] = useState<{
    url: string;
    ratio: number;
  }>();
  const overlayRef = useRef<SVGSVGElement>(null);
  const pressedAt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isLoaded = loadedPhoto?.url === photoUrl;
  const ratio = isLoaded ? loadedPhoto.ratio : undefined;

  const hasHighlight = lines.some(
    (line) => line.idRoute === idHighlightedRoute
  );

  return (
    <FrameStyled isContained={!!isContained && !!ratio} ratio={ratio}>
      <ImageStyled
        src={photoUrl}
        alt={label}
        decoding="async"
        isContained={!!isContained && !!ratio}
        isLoaded={isLoaded}
        onLoad={({ currentTarget }) =>
          setLoadedPhoto({
            url: currentTarget.src,
            ratio: currentTarget.naturalWidth / currentTarget.naturalHeight
          })
        }
      />
      {!isLoaded && (
        <LoaderStyled>
          <CircularProgress size={28} />
        </LoaderStyled>
      )}
      <OverlayStyled
        ref={overlayRef}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        isLoaded={isLoaded}
        isHoverable={!!onHoverRoute || !!onSelectRoute}
        onPointerDown={(event: ReactPointerEvent<SVGSVGElement>) => {
          pressedAt.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event: ReactPointerEvent<SVGSVGElement>) => {
          if (!onHoverRoute || !overlayRef.current) return;

          onHoverRoute(
            findNearestLine(
              lines,
              pointerToPhoto(event, overlayRef.current),
              toleranceOf(overlayRef.current, HOVER_TOLERANCE)
            )
          );
        }}
        onPointerLeave={() => onHoverRoute?.(undefined)}
        onClick={(event: ReactPointerEvent<SVGSVGElement>) => {
          if (!onSelectRoute || !overlayRef.current) return;

          const travel = Math.hypot(
            event.clientX - pressedAt.current.x,
            event.clientY - pressedAt.current.y
          );

          if (travel > TAP_SLOP) return;

          const idRoute = findNearestLine(
            lines,
            pointerToPhoto(event, overlayRef.current),
            toleranceOf(overlayRef.current, HOVER_TOLERANCE)
          );

          if (idRoute) onSelectRoute(idRoute);
        }}
      >
        <title>{label}</title>
        {lines.map((line) => {
          const isHighlighted = idHighlightedRoute === line.idRoute;
          const path = smoothPath(line.points);

          return (
            <g key={line.idRoute}>
              {isHighlighted && <OutlineStyled d={path} />}
              <PathStyled
                d={path}
                lineColor={colorOf?.(line.idRoute)}
                isHighlighted={isHighlighted}
                lineAlpha={lineOpacity(isHighlighted, hasHighlight)}
              />
            </g>
          );
        })}
      </OverlayStyled>
      {isLoaded &&
        lines.flatMap((line) => {
          const lineColor = colorOf?.(line.idRoute);
          const alpha = lineOpacity(
            idHighlightedRoute === line.idRoute,
            hasHighlight
          );

          return [
            ...line.bolts.map(([x, y]) => (
              <TopoPointMark
                key={`bolt-${line.idRoute}-${x}-${y}`}
                kind="bolt"
                x={x}
                y={y}
                color={lineColor}
                opacity={alpha}
              />
            )),
            ...(line.anchor
              ? [
                  <TopoPointMark
                    key={`anchor-${line.idRoute}`}
                    kind="anchor"
                    x={line.anchor[0]}
                    y={line.anchor[1]}
                    color={lineColor}
                    opacity={alpha}
                  />
                ]
              : [])
          ];
        })}
      {isLoaded &&
        numberOf &&
        lines.map((line) =>
          numberOf[line.idRoute] && line.points.length > 0 ? (
            <TopoRouteBadge
              key={line.idRoute}
              number={numberOf[line.idRoute]}
              grade={line.grade}
              gradeScale={line.gradeScale}
              name={
                lines.length === 1 || idHighlightedRoute === line.idRoute
                  ? line.routeName
                  : undefined
              }
              x={line.points[0][0] + line.labelOffsetX}
              y={line.points[0][1] + line.labelOffsetY}
              isHighlighted={idHighlightedRoute === line.idRoute}
              isDimmed={hasHighlight && idHighlightedRoute !== line.idRoute}
              onSelect={
                onSelectRoute ? () => onSelectRoute(line.idRoute) : undefined
              }
              onHover={(isOver) =>
                onHoverRoute?.(isOver ? line.idRoute : undefined)
              }
            />
          ) : null
        )}
    </FrameStyled>
  );
};

const HOVER_TOLERANCE = 16;

/** Past this the pointer was panning the photo, not tapping a line. */
const TAP_SLOP = 4;

const FALLBACK_RATIO = '4 / 3';

/* The frame takes the photo's ratio: any gap between the two boxes would
   slide every line off the rock. */
const FrameStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isContained' && prop !== 'ratio'
})<{ isContained: boolean; ratio?: number }>`
  position: relative;
  width: ${({ isContained }) => (isContained ? 'auto' : '100%')};
  height: ${({ isContained }) => (isContained ? '100%' : 'auto')};
  max-width: 100%;
  aspect-ratio: ${({ ratio }) => ratio ?? FALLBACK_RATIO};
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ImageStyled = styled('img', {
  shouldForwardProp: (prop) => prop !== 'isContained' && prop !== 'isLoaded'
})<{ isContained: boolean; isLoaded: boolean }>`
  display: block;
  width: 100%;
  height: ${({ isContained }) => (isContained ? '100%' : 'auto')};
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

const OutlineStyled = styled('path')`
  fill: none;
  stroke: ${({ theme }) => theme.palette.background.paper};
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
  vector-effect: non-scaling-stroke;
`;

const PathStyled = styled('path', {
  shouldForwardProp: (prop) =>
    prop !== 'lineAlpha' && prop !== 'isHighlighted' && prop !== 'lineColor'
})<{ lineAlpha: number; isHighlighted: boolean; lineColor?: string }>`
  fill: none;
  stroke: ${({ theme, lineColor }) =>
    lineColor ?? theme.palette.secondary.main};
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
  /* non-scaling-stroke measures in px, so the line stays this thick at any
     photo size — and the stretched viewBox cannot squash it. */
  stroke-width: ${({ isHighlighted }) => (isHighlighted ? 4 : 3)};
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: ${({ lineAlpha }) => lineAlpha};
  vector-effect: non-scaling-stroke;
`;
