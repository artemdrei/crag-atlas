import { describe, expect, it } from 'vitest';

import { FINDER_SIZE, qrShapeOf } from './qrShape';

describe('qrShapeOf', () => {
  const shape = qrShapeOf('https://cragatlas.app/q/ua/kamianets/mist');

  it('places the three finder squares in their corners', () => {
    expect(shape.finders).toEqual([
      [0, 0],
      [shape.size - FINDER_SIZE, 0],
      [0, shape.size - FINDER_SIZE]
    ]);
  });

  it('leaves the finder squares out of the dots drawn one by one', () => {
    const inCorner = shape.dots.some(
      ([x, y]) => x < FINDER_SIZE && y < FINDER_SIZE
    );

    expect(inCorner).toBe(false);
    expect(shape.dots.length).toBeGreaterThan(100);
  });
});
