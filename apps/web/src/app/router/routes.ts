export const ROUTES = {
  INDEX: '/',
  ACCESS: '/access',
  ADMIN: '/admin',
  ADMIN_ACCESS: '/admin/access',
  ADMIN_QR_CODES: '/admin/qr-codes',
  ADMIN_FEEDBACK: '/admin/feedback',
  LOGBOOK: '/logbook',
  LOGIN: '/login',
  PROFILE: '/profile',
  REGION: '/regions/:idRegion',
  PLAYGROUND: '/playground',
  QR: '/q/*',
  SECTOR: '/regions/:idRegion/sectors/:idSector',
  ROUTE_DETAIL: '/regions/:idRegion/sectors/:idSector/routes/:idRoute',
  SECTOR_EDIT: '/regions/:idRegion/sectors/:idSector/edit',
  ROUTE_EDIT: '/regions/:idRegion/sectors/:idSector/routes/:idRoute/edit'
} as const;

export const buildRegionPath = (idRegion: string) => `/regions/${idRegion}`;

export const buildSectorPath = (idRegion: string, idSector: string) =>
  `/regions/${idRegion}/sectors/${idSector}`;

export const buildRoutePath = (
  idRegion: string,
  idSector: string,
  idRoute: string
) => `/regions/${idRegion}/sectors/${idSector}/routes/${idRoute}`;

export const buildSectorEditPath = (idRegion: string, idSector: string) =>
  `/regions/${idRegion}/sectors/${idSector}/edit`;

export const buildRouteEditPath = (
  idRegion: string,
  idSector: string,
  idRoute: string
) => `/regions/${idRegion}/sectors/${idSector}/routes/${idRoute}/edit`;
