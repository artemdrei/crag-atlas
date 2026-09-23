import type { Sector } from '@crag-atlas/api';

import type { Coords } from '../entities';

export const sectorPoint = (sector?: Sector | null): Coords | undefined =>
  sector?.lat != null && sector.lng != null
    ? { lat: sector.lat, lng: sector.lng }
    : undefined;
