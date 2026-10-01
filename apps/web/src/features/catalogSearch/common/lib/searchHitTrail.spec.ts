import type { SearchHit } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { searchHitTrail } from './searchHitTrail';

const hit = (fields: Partial<SearchHit>): SearchHit =>
  ({ id: 'x', name: 'X', idRegion: 'r1', ...fields }) as SearchHit;

describe('searchHitTrail', () => {
  it('reads down the catalog, skipping what the hit does not have', () => {
    expect(searchHitTrail(hit({ regionName: 'Kamianets' }))).toBe('Kamianets');
    expect(
      searchHitTrail(hit({ regionName: 'Kamianets', sectorName: 'Mist' }))
    ).toBe('Kamianets · Mist');
    expect(searchHitTrail(hit({}))).toBe('');
  });
});
