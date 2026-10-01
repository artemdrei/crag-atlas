import type { SearchHit } from '@crag-atlas/api';

export const searchHitTrail = (hit: SearchHit): string =>
  [hit.regionName, hit.sectorName].filter(Boolean).join(' · ');
