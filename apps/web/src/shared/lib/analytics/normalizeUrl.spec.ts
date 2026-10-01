import { describe, expect, it } from 'vitest';

import { normalizeUrl } from './normalizeUrl';

describe('normalizeUrl', () => {
  it('masks the ids a referrer carries', () => {
    expect(
      normalizeUrl(
        'https://cragatlas.app/regions/0f1e4a2b-1c3d-4e5f-8a9b-0c1d2e3f4a5b/sectors/1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d'
      )
    ).toBe('https://cragatlas.app/regions/:id/sectors/:id');
  });

  it('drops the query and hash', () => {
    expect(normalizeUrl('https://cragatlas.app/logbook?sort=grade#top')).toBe(
      'https://cragatlas.app/logbook'
    );
  });

  it('leaves a referrer it cannot parse alone', () => {
    expect(normalizeUrl('android-app://com.google.android.gm')).toBe(
      'android-app://com.google.android.gm'
    );
  });
});
