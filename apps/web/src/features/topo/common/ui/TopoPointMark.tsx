import type { PointerEvent as ReactPointerEvent } from 'react';

import { styled } from '@mui/material/styles';

export type TopoMarkKind = 'bolt' | 'anchor' | 'handle';

export interface Props {
  kind: TopoMarkKind;
  x: number;
  y: number;
  color?: string;
  opacity?: number;
  isSelected?: boolean;
  isInteractive?: boolean;
  className?: string;
  onPointerDown?: (event: ReactPointerEvent) => void;
  onPointerMove?: (event: ReactPointerEvent) => void;
  onPointerUp?: (event: ReactPointerEvent) => void;
}

export const TopoPointMark = ({
  kind,
  x,
  y,
  color,
  opacity = 1,
  isSelected,
  isInteractive,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: Props) => (
  <MarkStyled
    className={className}
    x={x}
    y={y}
    kind={kind}
    markColor={color}
    opacity={opacity}
    isSelected={!!isSelected}
    isInteractive={!!isInteractive}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
  />
);

const MarkStyled = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'x' &&
    prop !== 'y' &&
    prop !== 'kind' &&
    prop !== 'markColor' &&
    prop !== 'opacity' &&
    prop !== 'isSelected' &&
    prop !== 'isInteractive'
})<{
  x: number;
  y: number;
  kind: TopoMarkKind;
  markColor?: string;
  opacity: number;
  isSelected: boolean;
  isInteractive: boolean;
}>`
  position: absolute;
  left: ${({ x }) => x * 100}%;
  top: ${({ y }) => y * 100}%;
  width: 22px;
  height: 22px;
  margin: -11px 0 0 -11px;
  border-radius: 50%;
  opacity: ${({ opacity }) => opacity};
  pointer-events: ${({ isInteractive }) => (isInteractive ? 'auto' : 'none')};
  cursor: ${({ isInteractive }) => (isInteractive ? 'grab' : 'default')};
  touch-action: none;

  &:active {
    cursor: ${({ isInteractive }) => (isInteractive ? 'grabbing' : 'default')};
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    box-shadow: 0 0 3px rgb(0 0 0 / 60%);
    background: ${({ theme, kind, markColor, isSelected }) => {
      if (kind === 'handle') {
        return isSelected
          ? theme.palette.primary.main
          : theme.palette.background.paper;
      }

      return markColor ?? theme.palette.secondary.main;
    }};
    border: 2px solid ${({ theme }) => theme.palette.background.paper};
    border-radius: ${({ kind }) => (kind === 'anchor' ? '2px' : '50%')};
    width: ${({ kind }) => (kind === 'anchor' ? '22px' : '11px')};
    height: ${({ kind }) => (kind === 'anchor' ? '8px' : '11px')};
  }
`;
