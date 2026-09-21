import { describe, expect, it } from 'vitest';

import { gradeScore, gradeScoreRange, isValidGrade } from './grade';

describe('grade', () => {
  it('accepts a grade only in the scale that defines it', () => {
    expect(isValidGrade('7a', 'french')).toBe(true);
    expect(isValidGrade('5.11a', 'french')).toBe(false);
    expect(isValidGrade('5.11a', 'yds')).toBe(true);
  });

  it('scores grades from different scales on one axis', () => {
    expect(gradeScore('7a', 'french')).toBeGreaterThan(
      gradeScore('5.10a', 'yds')
    );
  });

  it('gives a grade the full span it covers, for range filters', () => {
    expect(gradeScoreRange('6a', 'french')).toEqual([60, 61]);
    expect(gradeScoreRange('6c', 'french')).toEqual([68, 69]);
  });
});
