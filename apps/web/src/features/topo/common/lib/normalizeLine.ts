/**
 * In photo coordinates y grows downwards, so the start of a route is the point
 * with the larger y.
 */
export const normalizeLineDirection = (points: number[][]): number[][] => {
  if (points.length < 2) return points;

  const isTopFirst = points[0][1] < points[points.length - 1][1];

  return isTopFirst ? [...points].reverse() : points;
};
