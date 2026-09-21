import type { Point, PointKind } from '../entities';

export const toPointKinds = (
  points: Point[],
  bolts: number[][],
  anchor: number[] | null
): PointKind[] => {
  const boltKeys = new Set(bolts.map(keyOf));
  const anchorKey = anchor ? keyOf(anchor) : undefined;

  return points.map((point) => {
    const key = keyOf(point);

    if (key === anchorKey) return 'anchor';

    return boltKeys.has(key) ? 'bolt' : 'plain';
  });
};

export const boltsOf = (points: Point[], kinds: PointKind[]): Point[] =>
  points.filter((_point, index) => kinds[index] === 'bolt');

export const anchorOf = (points: Point[], kinds: PointKind[]): Point | null => {
  const index = kinds.indexOf('anchor');

  return index === -1 ? null : points[index];
};

const keyOf = ([x, y]: number[]): string => `${x}:${y}`;
