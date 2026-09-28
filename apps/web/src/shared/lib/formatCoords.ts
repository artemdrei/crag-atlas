import type { Coords } from '@web/shared/types';

const PRECISION = 5;

export const formatCoords = ({ lat, lng }: Coords) =>
  `${lat.toFixed(PRECISION)}, ${lng.toFixed(PRECISION)}`;
