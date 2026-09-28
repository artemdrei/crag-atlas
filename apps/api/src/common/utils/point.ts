import { ValidationException } from '../exceptions/app.exception';

export interface Coords {
  lat: number | null;
  lng: number | null;
}

// A point is placed on the map by hand, so a typo reaching the column's own
// check would answer with a write error nobody can read.
export const toPoint = (
  { lat, lng }: Partial<Coords>,
  entity: string
): Coords => {
  if (lat == null || lng == null) return { lat: null, lng: null };

  const isInRange = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!isInRange) {
    throw new ValidationException(
      'A point needs a latitude of -90..90 and a longitude of -180..180',
      `${entity}_POINT_OUT_OF_RANGE`
    );
  }

  return { lat, lng };
};
