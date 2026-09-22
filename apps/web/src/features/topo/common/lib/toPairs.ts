import type { Point } from './hitTest';

/**
 * The wire contract types a point as `number[]`, so the geometry would have to
 * re-check both coordinates on every read. Pairing them up once at the edge
 * keeps the maths working on tuples; a malformed point is dropped rather than
 * turned into a NaN that spreads through the curve.
 */
export const toPairs = (points: readonly number[][]): Point[] => {
  const pairs: Point[] = [];

  for (const point of points) {
    const [x, y] = point;

    if (x !== undefined && y !== undefined) pairs.push([x, y]);
  }

  return pairs;
};
