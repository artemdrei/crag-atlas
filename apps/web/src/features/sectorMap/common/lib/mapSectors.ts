import type { Sector } from '@crag-atlas/api';

import { coordsOf } from '@web/shared/lib';
import type { PointOverride } from '@web/shared/types';

import type { MappedSector } from '../entities';

export const mapSectors = (
  sectors: Sector[],
  override?: PointOverride
): MappedSector[] =>
  sectors.flatMap((sector, toneIndex) => {
    const point =
      override?.id === sector.id ? override.point : coordsOf(sector);

    return point ? [{ sector, point, toneIndex }] : [];
  });
