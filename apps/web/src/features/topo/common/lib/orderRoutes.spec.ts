import { describe, expect, it } from 'vitest';

import { orderRoutes } from './orderRoutes';

const line = (idRoute: string, x: number) => ({
  idRoute,
  points: [
    [x, 0.9],
    [x, 0.1]
  ]
});

describe('orderRoutes', () => {
  it('numbers left to right within a photo', () => {
    expect(
      orderRoutes([
        { sortOrder: 0, lines: [line('right', 0.8), line('left', 0.2)] }
      ])
    ).toEqual({ left: 1, right: 2 });
  });

  it('exhausts a photo before moving to the next one', () => {
    expect(
      orderRoutes([
        { sortOrder: 1, lines: [line('second-photo', 0.1)] },
        { sortOrder: 0, lines: [line('first-photo', 0.9)] }
      ])
    ).toEqual({ 'first-photo': 1, 'second-photo': 2 });
  });

  it('skips routes without a line', () => {
    expect(
      orderRoutes([{ sortOrder: 0, lines: [{ idRoute: 'empty', points: [] }] }])
    ).toEqual({});
  });

  it('numbers undrawn routes after the drawn ones', () => {
    expect(
      orderRoutes(
        [{ sortOrder: 0, lines: [line('drawn', 0.5)] }],
        ['undrawn', 'also-undrawn']
      )
    ).toEqual({ drawn: 1, undrawn: 2, 'also-undrawn': 3 });
  });

  it('does not renumber a route that is already placed', () => {
    expect(
      orderRoutes([{ sortOrder: 0, lines: [line('drawn', 0.5)] }], ['drawn'])
    ).toEqual({ drawn: 1 });
  });

  it('numbers a route drawn on two photos once', () => {
    expect(
      orderRoutes([
        { sortOrder: 0, lines: [line('shared', 0.5)] },
        { sortOrder: 1, lines: [line('shared', 0.1), line('later', 0.2)] }
      ])
    ).toEqual({ shared: 1, later: 2 });
  });
});
