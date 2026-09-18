export const ROUTES = {
  INDEX: '/',
  REGION: '/regions/:regionId',
  SECTOR: '/regions/:regionId/sectors/:sectorId'
} as const;

export const buildRegionPath = (regionId: string) => `/regions/${regionId}`;

export const buildSectorPath = (regionId: string, sectorId: string) =>
  `/regions/${regionId}/sectors/${sectorId}`;
