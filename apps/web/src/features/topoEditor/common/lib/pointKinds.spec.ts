import { describe, expect, it } from 'vitest';

import type { Point } from '../entities';
import { anchorOf, boltsOf, toPointKinds } from './pointKinds';

const points: Point[] = [
  [0.2, 0.9],
  [0.2, 0.6],
  [0.2, 0.3],
  [0.2, 0.1]
];

describe('point kinds', () => {
  it('recovers kinds from stored coordinates', () => {
    expect(toPointKinds(points, [[0.2, 0.6]], [0.2, 0.1])).toEqual([
      'plain',
      'bolt',
      'plain',
      'anchor'
    ]);
  });

  it('treats a line with nothing marked as plain throughout', () => {
    expect(toPointKinds(points, [], null)).toEqual([
      'plain',
      'plain',
      'plain',
      'plain'
    ]);
  });

  it('round-trips back to coordinates', () => {
    const kinds = toPointKinds(points, [[0.2, 0.6]], [0.2, 0.1]);

    expect(boltsOf(points, kinds)).toEqual([[0.2, 0.6]]);
    expect(anchorOf(points, kinds)).toEqual([0.2, 0.1]);
  });

  it('reports no anchor when none is marked', () => {
    expect(anchorOf(points, toPointKinds(points, [], null))).toBeNull();
  });
});
