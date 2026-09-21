import { describe, expect, it } from 'vitest';

import { digitsOnly } from './digitsOnly';

describe('digitsOnly', () => {
  it('keeps digits and drops everything else', () => {
    expect(digitsOnly('18')).toBe('18');
    expect(digitsOnly('1e5')).toBe('15');
    expect(digitsOnly('-3')).toBe('3');
    expect(digitsOnly('12.5')).toBe('125');
    expect(digitsOnly('м')).toBe('');
  });
});
