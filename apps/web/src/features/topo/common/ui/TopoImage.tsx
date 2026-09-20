import { useState } from 'react';

import type { Topo } from '@crag-atlas/api';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

export interface Props {
  topo: Topo;
  idHighlightedRoute?: string;
  isContained?: boolean;
  colorOf?: (idRoute: string) => string | undefined;
}

export const TopoImage = ({
  topo,
  idHighlightedRoute,
  isContained,
  colorOf
}: Props) => {
  const [loadedPhoto, setLoadedPhoto] = useState<{
    url: string;
    ratio: number;
  }>();

  const isLoaded = loadedPhoto?.url === topo.photoUrl;
  const ratio = isLoaded ? loadedPhoto.ratio : undefined;

  const hasHighlight = topo.lines.some(
    (line) => line.idRoute === idHighlightedRoute
  );

  return (
    <FrameStyled isContained={!!isContained && !!ratio} ratio={ratio}>
      <ImageStyled
        src={topo.photoUrl}
        alt={topo.label}
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
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        isLoaded={isLoaded}
      >
        <title>{topo.label}</title>
        {topo.lines.map((line) => (
          <PathStyled
            key={line.idRoute}
            d={toPath(line.points)}
            lineColor={colorOf?.(line.idRoute)}
            isHighlighted={idHighlightedRoute === line.idRoute}
            isDimmed={hasHighlight && idHighlightedRoute !== line.idRoute}
          />
        ))}
      </OverlayStyled>
    </FrameStyled>
  );
};

const FALLBACK_RATIO = '4 / 3';

const toPath = (points: number[][]) =>
  points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ');

/* The frame takes the photo's ratio: any gap between the two boxes would
   slide every line off the rock. */
const FrameStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isContained' && prop !== 'ratio'
})<{ isContained: boolean; ratio?: number }>`
  position: relative;
  width: ${({ isContained }) => (isContained ? 'auto' : '100%')};
  height: ${({ isContained }) => (isContained ? '100%' : 'auto')};
  max-width: 100%;
  /* Until the photo reports its own ratio the frame keeps a stand-in one, so
     the box never collapses and reflows when a topo is switched. */
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
  shouldForwardProp: (prop) => prop !== 'isLoaded'
})<{ isLoaded: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ isLoaded }) => (isLoaded ? 1 : 0)};
  transition: opacity 0.2s ease-out;
`;

const PathStyled = styled('path', {
  shouldForwardProp: (prop) =>
    prop !== 'isDimmed' && prop !== 'isHighlighted' && prop !== 'lineColor'
})<{ isDimmed: boolean; isHighlighted: boolean; lineColor?: string }>`
  fill: none;
  stroke: ${({ theme, lineColor }) =>
    lineColor ?? theme.palette.secondary.main};
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
  /* non-scaling-stroke measures in px, so the line stays this thick at any
     photo size — and the stretched viewBox cannot squash it. */
  stroke-width: ${({ isHighlighted }) => (isHighlighted ? 4 : 3)};
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: ${({ isDimmed, isHighlighted }) => {
    if (isHighlighted) return 1;

    return isDimmed ? 0.25 : 0.6;
  }};
  vector-effect: non-scaling-stroke;
`;
