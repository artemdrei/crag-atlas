import type { Point } from './hitTest';

// The wire contract types a point as `number[]`, so pairing up once at the
// edge keeps the maths on tuples. A malformed point is dropped, not NaN.
export const toPairs = (points: readonly number[][]): Point[] => {
  const pairs: Point[] = [];

  for (const point of points) {
    const [x, y] = point;

    if (x !== undefined && y !== undefined) pairs.push([x, y]);
  }

  return pairs;
};
