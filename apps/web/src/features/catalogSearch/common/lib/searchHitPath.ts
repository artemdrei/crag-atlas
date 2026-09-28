import type { SearchHit } from '@crag-atlas/api';

import {
  buildRegionPath,
  buildRoutePath,
  buildSectorPath
} from '@web/app/router/routes';

export const searchHitPath = (hit: SearchHit): string => {
  if (hit.idRoute && hit.idSector) {
    return buildRoutePath(hit.idRegion, hit.idSector, hit.idRoute);
  }

  if (hit.idSector) {
    return buildSectorPath(hit.idRegion, hit.idSector);
  }

  return buildRegionPath(hit.idRegion);
};

export const searchHitTrail = (hit: SearchHit): string =>
  [hit.regionName, hit.sectorName].filter(Boolean).join(' · ');
