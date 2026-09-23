import type { Coords } from '../entities';

const PRECISION = 5;

export const formatCoords = ({ lat, lng }: Coords) =>
  `${lat.toFixed(PRECISION)}, ${lng.toFixed(PRECISION)}`;
