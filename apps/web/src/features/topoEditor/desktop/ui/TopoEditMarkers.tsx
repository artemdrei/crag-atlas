import type { PointerEvent as ReactPointerEvent } from 'react';

import { styled } from '@mui/material/styles';

import { lineOpacity, TopoPointMark } from '@web/features/topo';

import type { EditableLine } from '../../common';

export interface Props {
  lines: EditableLine[];
  idSelectedRoute?: string;
  idHoveredRoute?: string;
  idSelectedPoint?: number;
  areHandlesHidden?: boolean;
  colorOf: (idRoute: string) => string | undefined;
  onPointDown: (index: number, event: ReactPointerEvent) => void;
}

export const HANDLE_CLASS = 'topoEditHandle';

export const TopoEditMarkers = ({
  lines,
  idSelectedRoute,
  idHoveredRoute,
  idSelectedPoint,
  areHandlesHidden,
  colorOf,
  onPointDown
}: Props) => (
  <LayerStyled>
    {lines.flatMap((line) => {
      const isEditable = line.idRoute === idSelectedRoute && !areHandlesHidden;
      const alpha = lineOpacity(
        line.idRoute === idSelectedRoute || line.idRoute === idHoveredRoute,
        !!idSelectedRoute || !!idHoveredRoute
      );

      return line.points
        .map((point, index) => {
          const kind = line.kinds[index] ?? 'plain';

          if (kind === 'plain' && !isEditable) return null;

          return (
            <TopoPointMark
              // biome-ignore lint/suspicious/noArrayIndexKey: a coordinate key would remount the handle on every pointermove
              key={`${line.idRoute}-${index}`}
              className={isEditable ? HANDLE_CLASS : undefined}
              kind={kind === 'plain' ? 'handle' : kind}
              x={point[0]}
              y={point[1]}
              color={colorOf(line.idRoute)}
              isSelected={isEditable && index === idSelectedPoint}
              opacity={alpha}
              isInteractive={isEditable}
              onPointerDown={
                isEditable
                  ? (event: ReactPointerEvent) => onPointDown(index, event)
                  : undefined
              }
            />
          );
        })
        .filter(Boolean);
    })}
  </LayerStyled>
);

const LayerStyled = styled('div')`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;
