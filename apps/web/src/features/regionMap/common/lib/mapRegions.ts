import type { Region } from '@crag-atlas/api';

import { coordsOf } from '@web/shared/lib';
import type { MapPoint, PointOverride } from '@web/shared/types';

import type { MappedRegion } from '../entities';

export const mapRegions = (
  regions: Region[],
  override?: PointOverride
): MappedRegion[] =>
  regions.flatMap((region) => {
    const point =
      override?.id === region.id ? override.point : coordsOf(region);

    return point ? [{ region, point }] : [];
  });

export const regionMapPoints = (
  mapped: MappedRegion[],
  color: string
): MapPoint[] =>
  mapped.map(({ region, point }) => ({ id: region.id, point, color }));
