import { describe, expect, it } from 'vitest';

import { findTopoOfRoute } from './findTopoOfRoute';

const topo = (id: string, idRoutes: string[]) => ({
  id,
  sortOrder: 0,
  lines: idRoutes.map((idRoute) => ({
    idRoute,
    points: [
      [0.2, 0.9],
      [0.2, 0.1]
    ]
  }))
});

describe('findTopoOfRoute', () => {
  it('finds the photo a route is drawn on', () => {
    expect(
      findTopoOfRoute([topo('first', ['a']), topo('second', ['b'])], 'b')?.id
    ).toBe('second');
  });

  it('finds nothing for a route drawn nowhere', () => {
    expect(findTopoOfRoute([topo('first', ['a'])], 'b')).toBeUndefined();
  });

  it('ignores a line with no points', () => {
    expect(
      findTopoOfRoute(
        [{ id: 'first', sortOrder: 0, lines: [{ idRoute: 'a', points: [] }] }],
        'a'
      )
    ).toBeUndefined();
  });
});
