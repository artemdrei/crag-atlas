import type { SectorQr } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { qrWarningsOf } from './qrWarningsOf';

const row = (patch: Partial<SectorQr> = {}): SectorQr => ({
  idSector: 's1',
  idRegion: 'r1',
  regionName: 'Kamianets-Podilskyi',
  country: 'UA',
  sectorName: 'Mist',
  sectorNameLocal: 'Міст',
  isArchived: false,
  path: 'ua/kamianets/mist',
  oldPaths: [],
  ...patch
});

describe('qrWarningsOf', () => {
  it('has nothing to say about a sector ready to print', () => {
    expect(qrWarningsOf(row())).toEqual([]);
  });

  it('asks for a country before it asks for a path', () => {
    expect(qrWarningsOf(row({ country: null, path: null }))).toEqual([
      'noCountry'
    ]);
    expect(qrWarningsOf(row({ path: null }))).toEqual(['noPath']);
  });

  it('flags a plaque that would carry only the Latin name', () => {
    expect(qrWarningsOf(row({ sectorNameLocal: null }))).toEqual([
      'noLocalName'
    ]);
  });

  it('flags a slug numbered to dodge a twin', () => {
    expect(qrWarningsOf(row({ path: 'ua/kamianets/mist-2' }))).toEqual([
      'numberedSlug'
    ]);
  });

  it('flags a name too long for the plaque and an archived sector', () => {
    expect(
      qrWarningsOf(
        row({
          sectorNameLocal: 'Дуже довга назва сектора біля мосту',
          isArchived: true
        })
      )
    ).toEqual(['longName', 'archived']);
  });
});
