import { describe, expect, it } from 'vitest';

import { catalogIdsOfPath } from './catalogIdsOfPath';

const idRegion = '0f1e4a2b-1c3d-4e5f-8a9b-0c1d2e3f4a5b';
const idSector = '1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d';

describe('catalogIdsOfPath', () => {
  it('finds nothing outside the catalog', () => {
    expect(catalogIdsOfPath('/logbook')).toEqual({
      idRegion: undefined,
      idSector: undefined,
      idRoute: undefined
    });
  });

  it('reads the ids a sector path carries', () => {
    expect(
      catalogIdsOfPath(`/regions/${idRegion}/sectors/${idSector}`)
    ).toEqual({ idRegion, idSector, idRoute: undefined });
  });
});
