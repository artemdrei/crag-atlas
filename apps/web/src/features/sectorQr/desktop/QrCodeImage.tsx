import { useMemo } from 'react';

import { styled } from '@mui/material/styles';

import { FINDER_SIZE, QR_STYLE, qrShapeOf } from '../common';

export interface Props {
  url: string;
  label: string;
  size?: number;
}

const QUIET_ZONE = 2;

export const QrCodeImage = ({ url, label, size = 160 }: Props) => {
  const shape = useMemo(() => qrShapeOf(url), [url]);
  const box = shape.size + QUIET_ZONE * 2;

  return (
    <SvgStyled
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${box} ${box}`}
    >
      <PaperStyled
        x={-QUIET_ZONE}
        y={-QUIET_ZONE}
        width={box}
        height={box}
        rx={2}
      />
      <DotsStyled>
        {shape.dots.map(([x, y]) => (
          <rect
            key={`${x}:${y}`}
            x={x + QR_STYLE.dot.inset}
            y={y + QR_STYLE.dot.inset}
            width={QR_STYLE.dot.size}
            height={QR_STYLE.dot.size}
            rx={QR_STYLE.dot.radius}
          />
        ))}
      </DotsStyled>
      {shape.finders.map(([x, y]) => (
        <g key={`${x}:${y}`}>
          <InkStyled
            x={x}
            y={y}
            width={FINDER_SIZE}
            height={FINDER_SIZE}
            rx={QR_STYLE.finder.outer}
          />
          <PaperStyled
            x={x + 1}
            y={y + 1}
            width={FINDER_SIZE - 2}
            height={FINDER_SIZE - 2}
            rx={QR_STYLE.finder.middle}
          />
          <InkStyled
            x={x + 2}
            y={y + 2}
            width={FINDER_SIZE - 4}
            height={FINDER_SIZE - 4}
            rx={QR_STYLE.finder.inner}
          />
        </g>
      ))}
    </SvgStyled>
  );
};

const SvgStyled = styled('svg')`
  display: block;
  flex: none;
`;

// A code is printed dark on light whatever the screen's theme: a phone camera
// reads an inverted one badly.
const PaperStyled = styled('rect')`
  fill: ${({ theme }) => theme.palette.common.white};
`;

const InkStyled = styled('rect')`
  fill: ${({ theme }) => theme.palette.common.black};
`;

const DotsStyled = styled('g')`
  fill: ${({ theme }) => theme.palette.common.black};
`;
