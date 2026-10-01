// In photo coordinates y grows downwards, so a route starts at the larger y.
export const normalizeLineDirection = <T extends number[]>(
  points: T[]
): T[] => {
  const [, firstY] = points[0] ?? [];
  const [, lastY] = points[points.length - 1] ?? [];

  if (firstY === undefined || lastY === undefined) return points;

  return firstY < lastY ? [...points].reverse() : points;
};
