import { describe, expect, it } from 'vitest';

import { foldGradeBars } from './foldGradeBars';
import type { GradeBar } from './gradeBars';

const bar = (
  label: string,
  count: number,
  tone: GradeBar['tone'] = '6'
): GradeBar => ({
  key: `french|${label}`,
  label,
  tone,
  count
});

describe('foldGradeBars', () => {
  it('leaves a spread the limit already fits', () => {
    const bars = [bar('6c', 2), bar('6c+', 2)];

    expect(foldGradeBars(bars, 2)).toEqual(bars);
  });

  it('folds a grade and its plus into one column', () => {
    const folded = foldGradeBars([bar('6c', 2), bar('6c+', 2)], 1);

    expect(folded.map(({ label, count }) => [label, count])).toEqual([
      ['6c', 4]
    ]);
  });

  it('folds everything below 6a into one column', () => {
    const folded = foldGradeBars(
      [bar('5b', 1, '5'), bar('5c', 2, '5'), bar('5c+', 3, '5'), bar('6a', 4)],
      1
    );

    expect(folded.map(({ label, count }) => [label, count])).toEqual([
      ['<5c', 6],
      ['6a', 4]
    ]);
  });

  it('leaves a plus whose base is not there', () => {
    const folded = foldGradeBars([bar('6b', 1), bar('6c+', 2)], 1);

    expect(folded.map(({ label }) => label)).toEqual(['6b', '6c+']);
  });
});
