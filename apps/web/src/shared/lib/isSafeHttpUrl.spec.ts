import { describe, expect, it } from 'vitest';

import { isSafeHttpUrl } from './isSafeHttpUrl';

describe('isSafeHttpUrl', () => {
  it('accepts http and https links', () => {
    expect(isSafeHttpUrl('http://example.com/topo')).toBe(true);
    expect(isSafeHttpUrl('https://example.com/topo')).toBe(true);
  });

  it('rejects script-bearing schemes', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(
      false
    );
  });

  it('rejects empty and unparsable values', () => {
    expect(isSafeHttpUrl('')).toBe(false);
    expect(isSafeHttpUrl(null)).toBe(false);
    expect(isSafeHttpUrl('example.com')).toBe(false);
  });
});
