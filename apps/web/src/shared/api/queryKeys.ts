/**
 * Every query key lives here, not next to its hook: a mutation in one slice
 * has to invalidate a query owned by another (logging a tick refreshes the
 * logbook), and cross-slice imports are banned. `shared` is the only place
 * both sides may import from.
 */
export const QUERY_KEYS = {
  // `regions` and `sector` are prefixes of everything below them, so a
  // mutation that changes a derived count invalidates one of the two instead
  // of listing every affected query. `list`/`detail` keep a uuid from ever
  // colliding with a literal segment.
  regions: () => ['regions'] as const,
  regionList: (isArchiveOnly: boolean) =>
    ['regions', 'list', isArchiveOnly] as const,
  region: (idRegion: string) => ['regions', 'detail', idRegion] as const,
  sectorList: (idRegion: string, isArchiveOnly: boolean) =>
    ['regions', 'detail', idRegion, 'sectors', isArchiveOnly] as const,
  sectors: () => ['sectors'] as const,
  sector: (idSector: string) => ['sectors', 'detail', idSector] as const,
  routeList: (idSector: string, isArchiveOnly: boolean) =>
    ['sectors', 'detail', idSector, 'routes', isArchiveOnly] as const,
  topos: (idSector: string) =>
    ['sectors', 'detail', idSector, 'topos'] as const,
  routes: () => ['routes'] as const,
  route: (idRoute: string) => ['routes', idRoute] as const,
  routeComments: (idRoute: string) => ['routes', idRoute, 'comments'] as const,
  routeMedia: (idRoute: string) => ['routes', idRoute, 'media'] as const,
  ticks: () => ['ticks'] as const,
  routeTicks: (idRoute: string) => ['ticks', idRoute] as const,
  ticksFeed: () => ['ticks', 'feed'] as const,
  userSearch: (query: string) => ['users', 'search', query] as const,
  climberContents: () => ['climberContent'] as const,
  climberContent: (scope: string, id: string) =>
    ['climberContent', scope, id] as const,
  me: () => ['me'] as const
} as const;
