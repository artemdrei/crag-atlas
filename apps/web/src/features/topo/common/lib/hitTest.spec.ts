import { describe, expect, it } from 'vitest';

import type { HittableLine, Point } from './hitTest';
import {
  findNearestLine,
  findNearestPoint,
  findNearestSegment,
  projectOntoSegment
} from './hitTest';

const rightAngle: Point[] = [
  [0.2, 0.8],
  [0.2, 0.2],
  [0.8, 0.2]
];

const line = (idRoute: string, points: Point[]): HittableLine => ({
  idRoute,
  points
});

describe('findNearestPoint', () => {
  it('finds a handle within tolerance', () => {
    expect(findNearestPoint(rightAngle, [0.21, 0.21], 0.05)).toBe(1);
  });

  it('rejects anything past the tolerance', () => {
    expect(findNearestPoint(rightAngle, [0.5, 0.5], 0.05)).toBe(-1);
  });
});

describe('findNearestSegment', () => {
  it('picks the closer leg of a right angle', () => {
    expect(findNearestSegment(rightAngle, [0.5, 0.22], 0.05)?.index).toBe(1);
  });

  it('returns the projection, not the click', () => {
    expect(
      findNearestSegment(rightAngle, [0.25, 0.5], 0.06)?.projection
    ).toEqual([0.2, 0.5]);
  });

  it('finds nothing when the click is far away', () => {
    expect(findNearestSegment(rightAngle, [0.9, 0.9], 0.05)).toBeUndefined();
  });
});

describe('projectOntoSegment', () => {
  it('clamps past the end of a segment', () => {
    expect(projectOntoSegment([0.5, 0.5], [0, 0], [0.1, 0])).toEqual([0.1, 0]);
  });

  it('collapses a zero-length segment onto its point', () => {
    expect(projectOntoSegment([0.5, 0.5], [0.2, 0.2], [0.2, 0.2])).toEqual([
      0.2, 0.2
    ]);
  });
});

describe('findNearestLine', () => {
  it('picks the closest line', () => {
    const lines = [
      line('far', [
        [0.9, 0.9],
        [0.9, 0.1]
      ]),
      line('near', [
        [0.2, 0.9],
        [0.2, 0.1]
      ])
    ];

    expect(findNearestLine(lines, [0.22, 0.5], 0.05)).toBe('near');
  });
});
