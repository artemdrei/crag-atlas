import { describe, expect, it } from 'vitest';

import { lineOpacity } from './lineOpacity';

describe('lineOpacity', () => {
  it('leaves every route solid while nothing is in focus', () => {
    expect(lineOpacity(false, false)).toBe(1);
  });

  it('keeps the focused route solid', () => {
    expect(lineOpacity(true, true)).toBe(1);
  });

  it('pushes the others back', () => {
    expect(lineOpacity(false, true)).toBeLessThan(1);
  });
});
