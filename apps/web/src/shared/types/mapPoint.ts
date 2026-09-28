import type { Coords } from './coords';

export interface MapPoint {
  id: string;
  point: Coords;
  color: string;
}

export interface PointOverride {
  id: string;
  point?: Coords;
}
