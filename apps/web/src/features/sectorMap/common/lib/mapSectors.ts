import type { Sector } from '@crag-atlas/api';

import type { Coords, MappedSector } from '../entities';
import { sectorPoint } from './sectorPoint';

export interface PointOverride {
  idSector: string;
  point?: Coords;
}

export const mapSectors = (
  sectors: Sector[],
  override?: PointOverride
): MappedSector[] =>
  sectors.flatMap((sector, toneIndex) => {
    const point =
      override?.idSector === sector.id ? override.point : sectorPoint(sector);

    return point ? [{ sector, point, toneIndex }] : [];
  });
