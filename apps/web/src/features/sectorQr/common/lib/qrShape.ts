import QRCode from 'qrcode';

export type Cell = readonly [x: number, y: number];

export interface QrShape {
  size: number;
  dots: Cell[];
  finders: Cell[];
}

export const FINDER_SIZE = 7;

// H, the highest correction: a plaque on the rock gets scratched and dirty.
export const qrShapeOf = (text: string): QrShape => {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const { size } = modules;
  const finders: Cell[] = [
    [0, 0],
    [size - FINDER_SIZE, 0],
    [0, size - FINDER_SIZE]
  ];

  const isInFinder = (x: number, y: number) =>
    finders.some(
      ([fx, fy]) =>
        x >= fx && x < fx + FINDER_SIZE && y >= fy && y < fy + FINDER_SIZE
    );

  const dots: Cell[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (modules.get(y, x) && !isInFinder(x, y)) dots.push([x, y]);
    }
  }

  return { size, dots, finders };
};

// In module units. Dots fill most of their cell and the corners stay modest:
// rounder or smaller shapes look softer but read worse in a phone camera.
export const QR_STYLE = {
  dot: { inset: 0.04, size: 0.92, radius: 0.3 },
  finder: { outer: 1.6, middle: 1.1, inner: 0.7 }
} as const;
