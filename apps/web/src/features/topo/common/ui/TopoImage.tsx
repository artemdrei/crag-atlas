import type { Topo } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

export interface Props {
  topo: Topo;
  /** When set, every other line is dimmed — the route page highlights one. */
  idHighlightedRoute?: string;
}

/**
 * Lines are stored as 0..1 fractions, so the SVG uses a 0..1 viewBox and
 * stretches with the photo: no layout maths, and any photo size renders right.
 */
export const TopoImage = ({ topo, idHighlightedRoute }: Props) => (
  <FrameStyled>
    <ImageStyled src={topo.photoUrl} alt={topo.label} />
    <OverlayStyled viewBox="0 0 1 1" preserveAspectRatio="none">
      <title>{topo.label}</title>
      {topo.lines.map((line) => (
        <PathStyled
          key={line.idRoute}
          d={toPath(line.points)}
          isDimmed={!!idHighlightedRoute && idHighlightedRoute !== line.idRoute}
        />
      ))}
    </OverlayStyled>
  </FrameStyled>
);

const toPath = (points: number[][]) =>
  points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ');

const FrameStyled = styled('div')`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ImageStyled = styled('img')`
  display: block;
  width: 100%;
  height: auto;
`;

const OverlayStyled = styled('svg')`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const PathStyled = styled('path', {
  shouldForwardProp: (prop) => prop !== 'isDimmed'
})<{ isDimmed: boolean }>`
  fill: none;
  stroke: ${({ theme }) => theme.palette.secondary.main};
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
  /* non-scaling-stroke measures in px, so the line stays this thick at any
     photo size — and the stretched viewBox cannot squash it. */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: ${({ isDimmed }) => (isDimmed ? 0.35 : 1)};
  vector-effect: non-scaling-stroke;
`;
