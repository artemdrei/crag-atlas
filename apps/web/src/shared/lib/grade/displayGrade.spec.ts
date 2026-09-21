import { describe, expect, it } from 'vitest';

import { displayGrade } from './displayGrade';

describe('displayGrade', () => {
  it('leaves a grade alone when no system is preferred', () => {
    expect(displayGrade('7a', 'french', null)).toBe('7a');
    expect(displayGrade('7a', 'french', 'french')).toBe('7a');
  });

  it('converts within a family', () => {
    expect(displayGrade('7a', 'french', 'yds')).toBe('5.11c/d');
    expect(displayGrade('7a', 'font', 'vscale')).toBe('V6');
  });

  it('keeps a grade as written when the families do not meet', () => {
    expect(displayGrade('7a', 'french', 'vscale')).toBe('7a');
    expect(displayGrade('V5', 'vscale', 'yds')).toBe('V5');
  });
});
