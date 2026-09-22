import type { Point } from '../entities';

const PRECISION = 1e5;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const normalizePoint = ([x, y]: Point): Point => [
  Math.round(clamp01(x) * PRECISION) / PRECISION,
  Math.round(clamp01(y) * PRECISION) / PRECISION
];
