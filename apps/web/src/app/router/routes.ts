export const ROUTES = {
  INDEX: '/',
  REGION: '/regions/:regionId'
} as const;

export const buildRegionPath = (regionId: string) => `/regions/${regionId}`;
