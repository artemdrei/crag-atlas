import type { Sector } from '@crag-atlas/api';

export interface Coords {
  lat: number;
  lng: number;
}

export interface MappedSector {
  sector: Sector;
  point: Coords;
  toneIndex: number;
}
