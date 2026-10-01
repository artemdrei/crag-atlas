const ID = '([0-9a-f-]{36})';

const REGION = new RegExp(`/regions/${ID}`, 'i');
const SECTOR = new RegExp(`/sectors/${ID}`, 'i');
const ROUTE = new RegExp(`/routes/${ID}`, 'i');

export interface CatalogIds {
  idRegion?: string;
  idSector?: string;
  idRoute?: string;
}

export const catalogIdsOfPath = (path: string): CatalogIds => ({
  idRegion: REGION.exec(path)?.[1],
  idSector: SECTOR.exec(path)?.[1],
  idRoute: ROUTE.exec(path)?.[1]
});
