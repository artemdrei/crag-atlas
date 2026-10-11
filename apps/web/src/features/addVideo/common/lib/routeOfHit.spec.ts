import type { SearchHit } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { routeOfHit } from './routeOfHit';

const hit = (overrides: Partial<SearchHit>): SearchHit =>
  ({
    id: 'route-1',
    idRegion: 'region-1',
    name: 'Pyrih',
    ...overrides
  }) as SearchHit;

describe('routeOfHit', () => {
  it('carries a full route hit over as it is', () => {
    expect(
      routeOfHit(
        hit({
          idRoute: 'route-2',
          idSector: 'sector-1',
          nameLocal: 'Пиріг',
          grade: '6c+',
          gradeScale: 'uiaa',
          sectorName: 'Bastion',
          regionName: 'Dovbush'
        })
      )
    ).toEqual({
      idRoute: 'route-2',
      idSector: 'sector-1',
      idRegion: 'region-1',
      name: 'Pyrih',
      nameLocal: 'Пиріг',
      grade: '6c+',
      gradeScale: 'uiaa',
      sectorName: 'Bastion',
      regionName: 'Dovbush'
    });
  });

  it('fills what a sparse hit leaves out', () => {
    expect(routeOfHit(hit({}))).toEqual({
      idRoute: 'route-1',
      idSector: '',
      idRegion: 'region-1',
      name: 'Pyrih',
      nameLocal: null,
      grade: '',
      gradeScale: 'french',
      sectorName: '',
      regionName: ''
    });
  });
});
