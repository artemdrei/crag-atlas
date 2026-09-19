import { useState } from 'react';

import type { Topo } from '@crag-atlas/api';
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
  const [ratio, setRatio] = useState<number>();

  const hasHighlight = topo.lines.some(
    (line) => line.idRoute === idHighlightedRoute
  );

  return (
    <FrameStyled isContained={!!isContained && !!ratio} ratio={ratio}>
      <ImageStyled
        src={topo.photoUrl}
        alt={topo.label}
        isContained={!!isContained && !!ratio}
        onLoad={({ currentTarget }) =>
          setRatio(currentTarget.naturalWidth / currentTarget.naturalHeight)
        }
      />
      <OverlayStyled viewBox="0 0 1 1" preserveAspectRatio="none">
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
  aspect-ratio: ${({ ratio }) => ratio ?? 'auto'};
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ImageStyled = styled('img', {
  shouldForwardProp: (prop) => prop !== 'isContained'
})<{ isContained: boolean }>`
  display: block;
  width: 100%;
  height: ${({ isContained }) => (isContained ? '100%' : 'auto')};
`;

const OverlayStyled = styled('svg')`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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
