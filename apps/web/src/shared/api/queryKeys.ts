/**
 * Every query key lives here, not next to its hook: a mutation in one slice
 * has to invalidate a query owned by another (logging a tick refreshes the
 * logbook), and cross-slice imports are banned. `shared` is the only place
 * both sides may import from.
 */
export const QUERY_KEYS = {
  regions: () => ['regions'] as const,
  region: (idRegion: string) => ['regions', idRegion] as const,
  sectors: (idRegion: string) => ['regions', idRegion, 'sectors'] as const,
  sector: (idSector: string) => ['sectors', idSector] as const,
  routes: (idSector: string) => ['sectors', idSector, 'routes'] as const,
  route: (idRoute: string) => ['routes', idRoute] as const,
  ticks: () => ['ticks'] as const,
  me: () => ['me'] as const
} as const;
