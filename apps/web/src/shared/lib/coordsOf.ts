import type { Coords } from '@web/shared/types';

export const coordsOf = (
  row?: { lat?: number | null; lng?: number | null } | null
): Coords | undefined =>
  row?.lat != null && row.lng != null
    ? { lat: row.lat, lng: row.lng }
    : undefined;
