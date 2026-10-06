// Every key lives here, not next to its hook: a mutation in one slice
// invalidates a query owned by another, and cross-slice imports are banned.
export const QUERY_KEYS = {
  // `regions` and `sector` are prefixes of everything below them, so one
  // invalidation covers a derived count. `list`/`detail` keep a uuid from
  // colliding with a literal segment.
  regions: () => ['regions'] as const,
  regionList: (isArchiveOnly: boolean) =>
    ['regions', 'list', isArchiveOnly] as const,
  region: (idRegion: string) => ['regions', 'detail', idRegion] as const,
  regionConditions: (idRegion: string) =>
    ['regions', 'detail', idRegion, 'conditions'] as const,
  sectorList: (idRegion: string, isArchiveOnly: boolean) =>
    ['regions', 'detail', idRegion, 'sectors', isArchiveOnly] as const,
  sectorsTicked: (idRegion: string) =>
    ['regions', 'detail', idRegion, 'sectors', 'ticked'] as const,
  sectors: () => ['sectors'] as const,
  sector: (idSector: string) => ['sectors', 'detail', idSector] as const,
  routeList: (idSector: string, isArchiveOnly: boolean) =>
    ['sectors', 'detail', idSector, 'routes', isArchiveOnly] as const,
  routesTicked: (idSector: string) =>
    ['sectors', 'detail', idSector, 'routes', 'ticked'] as const,
  sectorConditions: (idSector: string) =>
    ['sectors', 'detail', idSector, 'conditions'] as const,
  topos: (idSector: string) =>
    ['sectors', 'detail', idSector, 'topos'] as const,
  routes: () => ['routes'] as const,
  route: (idRoute: string) => ['routes', idRoute] as const,
  routeComments: (idRoute: string) => ['routes', idRoute, 'comments'] as const,
  routeMedia: (idRoute: string) => ['routes', idRoute, 'media'] as const,
  ticks: () => ['ticks'] as const,
  ticksPage: (filters: string) => ['ticks', 'page', filters] as const,
  tickStats: () => ['ticks', 'stats'] as const,
  routeLogbook: (idRoute: string) => ['ticks', 'route', idRoute] as const,
  myRouteTicks: (idRoute: string) => ['ticks', 'mine', idRoute] as const,
  ticksFeed: () => ['ticks', 'feed'] as const,
  weather: (idRoute: string, at: string) => ['weather', idRoute, at] as const,
  catalogSearch: (query: string) => ['catalog', 'search', query] as const,
  userSearch: (query: string) => ['users', 'search', query] as const,
  climberContents: () => ['climberContent'] as const,
  climberContent: (scope: string, id: string) =>
    ['climberContent', scope, id] as const,
  admins: () => ['admins'] as const,
  adminCandidates: () => ['admins', 'candidates'] as const,
  adminCandidateSearch: (query: string) =>
    ['admins', 'candidates', query] as const,
  qrPaths: () => ['qrPaths'] as const,
  sectorQrs: (filter: string) => ['qrPaths', 'list', filter] as const,
  qrPathTarget: (path: string) => ['qrPaths', 'target', path] as const,
  me: () => ['me'] as const,
  offlineRegions: () => ['offlineRegions'] as const
} as const;
