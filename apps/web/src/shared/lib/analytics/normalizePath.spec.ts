import { describe, expect, it } from 'vitest';

import { normalizePath } from './normalizePath';

describe('normalizePath', () => {
  it('keeps the root path', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('masks every uuid segment', () => {
    expect(
      normalizePath(
        '/regions/0f1e4a2b-1c3d-4e5f-8a9b-0c1d2e3f4a5b/sectors/1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d'
      )
    ).toBe('/regions/:id/sectors/:id');
  });

  it('leaves non-id segments alone', () => {
    expect(normalizePath('/logbook')).toBe('/logbook');
  });
});
