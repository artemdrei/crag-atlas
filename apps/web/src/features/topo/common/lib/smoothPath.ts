/**
 * Centripetal Catmull-Rom as cubic Beziers: it interpolates, so the curve
 * passes through every stored point and no line drifts off the rock. Uniform
 * would self-intersect on the sharp turns a traverse makes.
 */
export const smoothPath = (points: number[][]): string => {
  if (points.length < 2) return '';

  const start = `M${format(points[0])}`;

  if (points.length === 2) return `${start} L${format(points[1])}`;

  const padded = [points[0], ...points, points[points.length - 1]];
  const segments: string[] = [];

  for (let index = 1; index < padded.length - 2; index += 1) {
    const [first, second, third, fourth] = [
      padded[index - 1],
      padded[index],
      padded[index + 1],
      padded[index + 2]
    ];

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

const span = (from: number[], to: number[]): number =>
  Math.hypot(to[0] - from[0], to[1] - from[1]) ** ALPHA;

const controlPoint = (
  outer: number[],
  from: number[],
  to: number[],
  outerSpan: number,
  innerSpan: number
): number[] => {
  if (outerSpan === 0 || innerSpan === 0) return from;

  return [0, 1].map((axis) => {
    const tangent =
      (from[axis] - outer[axis]) / outerSpan -
      (to[axis] - outer[axis]) / (outerSpan + innerSpan) +
      (to[axis] - from[axis]) / innerSpan;

    return from[axis] + (tangent * innerSpan) / 3;
  });
};

const format = ([x, y]: number[]): string => `${round(x)} ${round(y)}`;

const round = (value: number): number => Math.round(value * 1e5) / 1e5;
