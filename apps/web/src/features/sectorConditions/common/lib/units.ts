export const toKmh = (metresPerSecond: number): number =>
  Math.round(metresPerSecond * 3.6);
