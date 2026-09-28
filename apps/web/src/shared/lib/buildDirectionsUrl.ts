import type { Coords } from '@web/shared/types';

export const buildDirectionsUrl = ({ lat, lng }: Coords) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
