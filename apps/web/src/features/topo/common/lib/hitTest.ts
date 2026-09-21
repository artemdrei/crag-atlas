export interface HittableLine {
  idRoute: string;
  points: number[][];
}

export type Point = [number, number];

const distance = (from: number[], to: number[]): number =>
  Math.hypot(to[0] - from[0], to[1] - from[1]);

export interface SegmentHit {
  index: number;
  projection: Point;
  distance: number;
}

/** Tested against the chord, not the rendered curve: they differ by a pixel. */
export const findNearestPoint = (
  points: number[][],
  target: Point,
  tolerance: number
): number => {
  let best = -1;
  let bestDistance = tolerance;

  points.forEach((point, index) => {
    const gap = distance(point, target);

    if (gap <= bestDistance) {
      best = index;
      bestDistance = gap;
    }
  });

  return best;
};

export const findNearestSegment = (
  points: number[][],
  target: Point,
  tolerance: number
): SegmentHit | undefined => {
  let best: SegmentHit | undefined;

  for (let index = 0; index < points.length - 1; index += 1) {
    const projection = projectOntoSegment(
      target,
      points[index],
      points[index + 1]
    );
    const gap = distance(projection, target);

    if (gap <= tolerance && (!best || gap < best.distance)) {
      best = { index, projection, distance: gap };
    }
  }

  return best;
};

export const findNearestLine = (
  lines: HittableLine[],
  target: Point,
  tolerance: number
): string | undefined => {
  let best: { idRoute: string; distance: number } | undefined;

  for (const line of lines) {
    const hit = findNearestSegment(line.points, target, tolerance);

    if (hit && (!best || hit.distance < best.distance)) {
      best = { idRoute: line.idRoute, distance: hit.distance };
    }
  }

  return best?.idRoute;
};

export const projectOntoSegment = (
  point: number[],
  from: number[],
  to: number[]
): Point => {
  const spanX = to[0] - from[0];
  const spanY = to[1] - from[1];
  const lengthSquared = spanX * spanX + spanY * spanY;

  if (lengthSquared === 0) return [from[0], from[1]];

  const t = Math.min(
    1,
    Math.max(
      0,
      ((point[0] - from[0]) * spanX + (point[1] - from[1]) * spanY) /
        lengthSquared
    )
  );

  return [from[0] + t * spanX, from[1] + t * spanY] as Point;
};
