import type { SectorQr } from '@crag-atlas/api';

import { FINDER_SIZE, QR_STYLE, qrShapeOf } from '../../common';

export const PLAQUE_MM = { width: 60, height: 60 } as const;

const PX_PER_MM = 12;
const QR_MM = 42;
const QR_TOP_MM = 3.5;
const TEXT_WIDTH_MM = 54;

export interface PlaqueStyle {
  ink: string;
  paper: string;
  titleFont: string;
  subtitleFont: string;
}

const px = (mm: number) => mm * PX_PER_MM;

const drawFitted = (
  context: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  sizes: { max: number; min: number },
  y: number
) => {
  let size = sizes.max;

  context.font = font(size);

  while (
    size > sizes.min &&
    context.measureText(text).width > px(TEXT_WIDTH_MM)
  ) {
    size -= 2;
    context.font = font(size);
  }

  context.fillText(text, px(PLAQUE_MM.width / 2), y, px(TEXT_WIDTH_MM));
};

// Printed text is a raster here: the canvas draws with the page's own web
// fonts, which jsPDF could only embed as whole files, Cyrillic and all.
export const drawQrPlaque = (
  row: SectorQr,
  url: string,
  style: PlaqueStyle
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = px(PLAQUE_MM.width);
  canvas.height = px(PLAQUE_MM.height);

  const context = canvas.getContext('2d');

  if (!context) return canvas;

  context.fillStyle = style.paper;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const shape = qrShapeOf(url);
  const cell = px(QR_MM) / shape.size;
  const origin = {
    x: px((PLAQUE_MM.width - QR_MM) / 2),
    y: px(QR_TOP_MM)
  };
  const cellAt = (x: number, y: number) => ({
    x: origin.x + x * cell,
    y: origin.y + y * cell
  });

  const fillRounded = (
    x: number,
    y: number,
    side: number,
    radius: number,
    color: string
  ) => {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, side, side, radius);
    context.fill();
  };

  for (const [x, y] of shape.dots) {
    const at = cellAt(x, y);

    fillRounded(
      at.x + cell * QR_STYLE.dot.inset,
      at.y + cell * QR_STYLE.dot.inset,
      cell * QR_STYLE.dot.size,
      cell * QR_STYLE.dot.radius,
      style.ink
    );
  }

  for (const [x, y] of shape.finders) {
    const at = cellAt(x, y);

    fillRounded(
      at.x,
      at.y,
      cell * FINDER_SIZE,
      cell * QR_STYLE.finder.outer,
      style.ink
    );
    fillRounded(
      at.x + cell,
      at.y + cell,
      cell * (FINDER_SIZE - 2),
      cell * QR_STYLE.finder.middle,
      style.paper
    );
    fillRounded(
      at.x + cell * 2,
      at.y + cell * 2,
      cell * (FINDER_SIZE - 4),
      cell * QR_STYLE.finder.inner,
      style.ink
    );
  }

  context.fillStyle = style.ink;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';

  const local = row.sectorNameLocal?.trim();
  const titleY = px(QR_TOP_MM + QR_MM + 6.5);

  drawFitted(
    context,
    local || row.sectorName,
    (size) => `700 ${size}px ${style.titleFont}`,
    { max: 56, min: 30 },
    titleY
  );

  if (local) {
    drawFitted(
      context,
      row.sectorName,
      (size) => `500 ${size}px ${style.subtitleFont}`,
      { max: 30, min: 22 },
      titleY + px(5)
    );
  }

  return canvas;
};
