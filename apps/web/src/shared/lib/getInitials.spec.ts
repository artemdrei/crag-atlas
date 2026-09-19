import { describe, expect, it } from 'vitest';

import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Crag Atlas')).toBe('CA');
  });

  it('takes the first two letters of a single word', () => {
    expect(getInitials('Crag')).toBe('CR');
  });

  it('ignores the domain part of an email', () => {
    expect(getInitials('cragatlasapp@gmail.com')).toBe('CR');
  });

  it('splits an email local part on separators', () => {
    expect(getInitials('crag.atlas@gmail.com')).toBe('CA');
  });

  it('returns an empty string when there is nothing to take', () => {
    expect(getInitials('')).toBe('');
  });
});
