import { describe, expect, it } from 'vitest';

import type { FilterableRoute } from '../entities';
import { gradeHistogramOf } from './gradeHistogramOf';

const route = (
  grade: string,
  type: FilterableRoute['type'] = 'sport'
): FilterableRoute => ({
  id: grade,
  grade,
  gradeScale: type === 'sport' ? 'french' : 'font',
  type
});

describe('gradeHistogramOf', () => {
  it('counts the routes per grade, easiest first, one group per type', () => {
    const order = { 'french|6a': 0, 'french|7a': 1, 'font|6A': 2 };

    expect(
      gradeHistogramOf(
        [route('7a'), route('6a'), route('7a'), route('6A', 'boulder')],
        order
      )
    ).toEqual([
      {
        type: 'sport',
        routeCount: 3,
        grades: [
          { grade: '6a', scale: 'french', count: 1 },
          { grade: '7a', scale: 'french', count: 2 }
        ]
      },
      {
        type: 'boulder',
        routeCount: 1,
        grades: [{ grade: '6A', scale: 'font', count: 1 }]
      }
    ]);
  });
});
