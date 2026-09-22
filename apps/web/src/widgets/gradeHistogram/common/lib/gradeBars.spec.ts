import type { GradeCount, GradeScale } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { toGradeBars } from './gradeBars';

const asGiven = (grade: string, _scale: GradeScale) => grade;

const french = (grade: string, count: number): GradeCount => ({
  grade,
  scale: 'french',
  count
});

describe('toGradeBars', () => {
  it('keeps one bar per grade, in the order it was given', () => {
    const bars = toGradeBars([french('6a', 7), french('6a+', 3)], asGiven);

    expect(bars).toEqual([
      { key: 'french|6a', label: '6a', tone: '6', count: 7 },
      { key: 'french|6a+', label: '6a+', tone: '6', count: 3 }
    ]);
  });

  it('keys a grade by its scale too, so 6a French is not 6a Font', () => {
    const [french] = toGradeBars(
      [{ grade: '6a', scale: 'french', count: 1 }],
      asGiven
    );
    const [font] = toGradeBars(
      [{ grade: '6a', scale: 'font', count: 1 }],
      asGiven
    );

    expect(french?.key).not.toBe(font?.key);
  });

  it('tones a grade by difficulty, whatever system it is written in', () => {
    const bars = toGradeBars(
      [{ grade: '5.11d', scale: 'yds', count: 1 }],
      asGiven
    );

    expect(bars[0]?.tone).toBe('7');
  });

  it('leaves an unscorable grade neutral', () => {
    const bars = toGradeBars(
      [{ grade: '6A', scale: 'font', count: 2 }],
      asGiven
    );

    expect(bars[0]?.tone).toBe('neutral');
  });

  it('shows the grade in the system the reader asked for', () => {
    const bars = toGradeBars([french('7a', 1)], (grade) => `${grade}!`);

    expect(bars[0]?.label).toBe('7a!');
  });
});
