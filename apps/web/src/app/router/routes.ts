export const ROUTES = {
  INDEX: '/',
  LOGBOOK: '/logbook',
  LOGIN: '/login',
  PROFILE: '/profile',
  REGION: '/regions/:idRegion',
  // Internal kitchen sink: deliberately not linked from any navigation.
  PLAYGROUND: '/playground',
  SECTOR: '/regions/:idRegion/sectors/:idSector',
  ROUTE_DETAIL: '/regions/:idRegion/sectors/:idSector/routes/:idRoute'
} as const;

export const buildRegionPath = (idRegion: string) => `/regions/${idRegion}`;

export const buildSectorPath = (idRegion: string, idSector: string) =>
  `/regions/${idRegion}/sectors/${idSector}`;

export const buildRoutePath = (
  idRegion: string,
  idSector: string,
  idRoute: string
) => `/regions/${idRegion}/sectors/${idSector}/routes/${idRoute}`;
