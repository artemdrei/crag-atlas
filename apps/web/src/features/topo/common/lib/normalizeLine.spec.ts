import { describe, expect, it } from 'vitest';

import { normalizeLineDirection } from './normalizeLine';

describe('normalizeLineDirection', () => {
  it('leaves a bottom-first line alone', () => {
    const points = [
      [0.2, 0.9],
      [0.3, 0.1]
    ];

    expect(normalizeLineDirection(points)).toBe(points);
  });

  it('reverses a top-first line', () => {
    expect(
      normalizeLineDirection([
        [0.3, 0.1],
        [0.25, 0.5],
        [0.2, 0.9]
      ])
    ).toEqual([
      [0.2, 0.9],
      [0.25, 0.5],
      [0.3, 0.1]
    ]);
  });

  it('leaves a line too short to have a direction alone', () => {
    expect(normalizeLineDirection([[0.2, 0.9]])).toEqual([[0.2, 0.9]]);
  });
});
