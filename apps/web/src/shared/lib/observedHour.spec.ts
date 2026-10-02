import { describe, expect, it } from 'vitest';

import { observedHour } from './observedHour';

describe('observedHour', () => {
  it('floors a clock time to its hour', () => {
    expect(observedHour('2026-10-01', '16:17')).toBe('2026-10-01T16:00');
  });

  it('leaves a whole hour alone', () => {
    expect(observedHour('2026-10-01', '16:00')).toBe('2026-10-01T16:00');
  });

  it('assumes early afternoon when no time was logged', () => {
    expect(observedHour('2026-10-01', '')).toBe('2026-10-01T14:00');
  });
});
