export const ROUTES = {
  INDEX: '/',
  REGION: '/regions/:regionId',
  SECTOR: '/regions/:regionId/sectors/:sectorId',
  ROUTE_DETAIL: '/regions/:regionId/sectors/:sectorId/routes/:routeId'
} as const;

export const buildRegionPath = (regionId: string) => `/regions/${regionId}`;

export const buildSectorPath = (regionId: string, sectorId: string) =>
  `/regions/${regionId}/sectors/${sectorId}`;

export const buildRoutePath = (
  regionId: string,
  sectorId: string,
  routeId: string
) => `/regions/${regionId}/sectors/${sectorId}/routes/${routeId}`;
