import type { Region, Sector } from '@crag-atlas/api';

import { apiGet, useApiQuery } from '@web/shared/api';
import { coordsOf } from '@web/shared/lib';

import type { ConditionsPlace } from '../entities';
import { placeSourceOf } from '../lib';

export const useApiGetPlaceCoords = (place: ConditionsPlace) => {
  const { detailPath, detailKey } = placeSourceOf(place);
  const { data } = useApiQuery({
    queryKey: detailKey,
    queryFn: () => apiGet<Sector | Region>(detailPath)
  });

  return { coords: coordsOf(data), isLoaded: !!data };
};
