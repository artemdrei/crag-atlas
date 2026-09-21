import { describe, expect, it } from 'vitest';

import { smoothPath } from './smoothPath';

describe('smoothPath', () => {
  it('draws nothing for fewer than two points', () => {
    expect(smoothPath([])).toBe('');
    expect(smoothPath([[0.1, 0.2]])).toBe('');
  });

  it('keeps two points a straight segment', () => {
    expect(
      smoothPath([
        [0.1, 0.9],
        [0.2, 0.1]
      ])
    ).toBe('M0.1 0.9 L0.2 0.1');
  });

  it('emits one cubic segment per interval', () => {
    const path = smoothPath([
      [0.1, 0.9],
      [0.2, 0.5],
      [0.3, 0.1]
    ]);

    expect(path.startsWith('M0.1 0.9')).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
  });

  it('passes exactly through every control point', () => {
    const points = [
      [0.1, 0.9],
      [0.25, 0.6],
      [0.2, 0.35],
      [0.4, 0.05]
    ];

    const ends = smoothPath(points)
      .split('C')
      .slice(1)
      .map((segment) => segment.trim().split(' ').slice(-2).map(Number));

    expect(ends).toEqual(points.slice(1));
  });

  it('survives a repeated point', () => {
    expect(() =>
      smoothPath([
        [0.2, 0.8],
        [0.2, 0.8],
        [0.3, 0.2]
      ])
    ).not.toThrow();
  });
});
