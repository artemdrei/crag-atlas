import type { Point } from './hitTest';
import { toPairs } from './toPairs';

// Centripetal Catmull-Rom: it interpolates, so the curve passes through every
// stored point. Uniform would self-intersect on a traverse's sharp turns.
export const smoothPath = (input: readonly number[][]): string => {
  const points = toPairs(input);
  const [head, next] = points;

  if (!head || !next) return '';

  const start = `M${format(head)}`;

  if (points.length === 2) return `${start} L${format(next)}`;

  const tail = points[points.length - 1] ?? head;
  const padded: Point[] = [head, ...points, tail];
  const segments: string[] = [];

  for (let index = 1; index < padded.length - 2; index += 1) {
    const first = padded[index - 1];
    const second = padded[index];
    const third = padded[index + 1];
    const fourth = padded[index + 2];

    if (!first || !second || !third || !fourth) continue;

    const firstSpan = span(first, second);
    const secondSpan = span(second, third);
    const thirdSpan = span(third, fourth);

    const controlA = controlPoint(first, second, third, firstSpan, secondSpan);
    const controlB = controlPoint(fourth, third, second, thirdSpan, secondSpan);

    segments.push(`C${format(controlA)} ${format(controlB)} ${format(third)}`);
  }

  return `${start} ${segments.join(' ')}`;
};

const ALPHA = 0.5;

const span = (from: Point, to: Point): number =>
  Math.hypot(to[0] - from[0], to[1] - from[1]) ** ALPHA;

const controlPoint = (
  outer: Point,
  from: Point,
  to: Point,
  outerSpan: number,
  innerSpan: number
): Point => {
  if (outerSpan === 0 || innerSpan === 0) return from;

  const along = (axis: 0 | 1) => {
    const tangent =
      (from[axis] - outer[axis]) / outerSpan -
      (to[axis] - outer[axis]) / (outerSpan + innerSpan) +
      (to[axis] - from[axis]) / innerSpan;

    return from[axis] + (tangent * innerSpan) / 3;
  };

  return [along(0), along(1)];
};

const format = ([x, y]: Point): string => `${round(x)} ${round(y)}`;

const round = (value: number): number => Math.round(value * 1e5) / 1e5;
