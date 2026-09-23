import type { Coords } from '../entities';

export const buildDirectionsUrl = ({ lat, lng }: Coords) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
