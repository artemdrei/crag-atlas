import { describe, expect, it } from 'vitest';

import { seasonOf } from './season';

describe('seasonOf', () => {
  it('splits the year into four seasons', () => {
    expect(seasonOf('2026-01-15')).toBe('winter');
    expect(seasonOf('2026-04-01')).toBe('spring');
    expect(seasonOf('2026-07-20')).toBe('summer');
    expect(seasonOf('2026-10-02')).toBe('autumn');
  });

  it('keeps December with the winter that follows it', () => {
    expect(seasonOf('2026-12-31')).toBe('winter');
  });

  it('has no season for a date it cannot read', () => {
    expect(seasonOf('')).toBeUndefined();
  });
});
