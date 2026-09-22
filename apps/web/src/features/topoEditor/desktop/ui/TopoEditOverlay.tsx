import { memo, useMemo } from 'react';

import { styled } from '@mui/material/styles';

import { lineOpacity, smoothPath } from '@web/features/topo';

import type { EditableLine, Point } from '../../common';

export interface Props {
  lines: EditableLine[];
  idSelectedRoute?: string;
  idHoveredRoute?: string;
  colorOf: (idRoute: string) => string | undefined;
}

export const TopoEditOverlay = ({
  lines,
  idSelectedRoute,
  idHoveredRoute,
  colorOf
}: Props) => {
  const hasFocus = !!idSelectedRoute || !!idHoveredRoute;

  return (
    <>
      {lines.map((line) => {
        const isFocused =
          line.idRoute === idSelectedRoute || line.idRoute === idHoveredRoute;

        return (
          <EditLine
            key={line.idRoute}
            points={line.points}
            lineColor={colorOf(line.idRoute)}
            isFocused={isFocused}
            lineAlpha={lineOpacity(isFocused, hasFocus)}
          />
        );
      })}
    </>
  );
};

interface EditLineProps {
  points: Point[];
  lineColor?: string;
  isFocused: boolean;
  lineAlpha: number;
}

// Dragging a point re-renders the whole overlay; without this the spline is
// rebuilt for every line on the photo on every pointermove, not just the
// dragged one. The reducer keeps untouched lines' points identical.
const EditLine = memo(
  ({ points, lineColor, isFocused, lineAlpha }: EditLineProps) => {
    const path = useMemo(() => smoothPath(points), [points]);

    return (
      <g>
        {isFocused && <OutlineStyled d={path} />}
        <PathStyled
          d={path}
          lineColor={lineColor}
          isSelected={isFocused}
          lineAlpha={lineAlpha}
        />
      </g>
    );
  }
);

const OutlineStyled = styled('path')`
  fill: none;
  stroke: ${({ theme }) => theme.palette.background.paper};
  stroke-width: 9;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
  vector-effect: non-scaling-stroke;
`;

const PathStyled = styled('path', {
  shouldForwardProp: (prop) =>
    prop !== 'lineColor' && prop !== 'isSelected' && prop !== 'lineAlpha'
})<{ lineColor?: string; isSelected: boolean; lineAlpha: number }>`
  fill: none;
  stroke: ${({ theme, lineColor }) =>
    lineColor ?? theme.palette.secondary.main};
  stroke-width: ${({ isSelected }) => (isSelected ? 4 : 3)};
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
  opacity: ${({ lineAlpha }) => lineAlpha};
  vector-effect: non-scaling-stroke;
`;
