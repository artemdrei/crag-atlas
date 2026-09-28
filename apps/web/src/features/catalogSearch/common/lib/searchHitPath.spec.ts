import type { SearchHit } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { searchHitPath, searchHitTrail } from './searchHitPath';

const hit = (fields: Partial<SearchHit>): SearchHit =>
  ({ id: 'x', name: 'X', idRegion: 'r1', ...fields }) as SearchHit;

describe('searchHitPath', () => {
  it('opens a region on its own page', () => {
    expect(searchHitPath(hit({}))).toBe('/regions/r1');
  });

  it('opens a sector under its region', () => {
    expect(searchHitPath(hit({ idSector: 's1' }))).toBe(
      '/regions/r1/sectors/s1'
    );
  });

  it('opens a route under its sector', () => {
    expect(searchHitPath(hit({ idSector: 's1', idRoute: 'q1' }))).toBe(
      '/regions/r1/sectors/s1/routes/q1'
    );
  });

  it('falls back to the region when the route lost its sector', () => {
    expect(searchHitPath(hit({ idRoute: 'q1' }))).toBe('/regions/r1');
  });
});

describe('searchHitTrail', () => {
  it('reads down the catalog, skipping what the hit does not have', () => {
    expect(searchHitTrail(hit({ regionName: 'Kamianets' }))).toBe('Kamianets');
    expect(
      searchHitTrail(hit({ regionName: 'Kamianets', sectorName: 'Mist' }))
    ).toBe('Kamianets · Mist');
    expect(searchHitTrail(hit({}))).toBe('');
  });
});
