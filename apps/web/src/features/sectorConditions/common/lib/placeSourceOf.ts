import { QUERY_KEYS } from '@web/shared/api';

import type { ConditionsPlace } from '../entities';

export const placeSourceOf = (place: ConditionsPlace) =>
  place.list === 'sector'
    ? {
        detailPath: `/sectors/${place.idSector}`,
        detailKey: QUERY_KEYS.sector(place.idSector),
        conditionsPath: `/sectors/${place.idSector}/conditions`,
        conditionsKey: QUERY_KEYS.sectorConditions(place.idSector)
      }
    : {
        detailPath: `/regions/${place.idRegion}`,
        detailKey: QUERY_KEYS.region(place.idRegion),
        conditionsPath: `/regions/${place.idRegion}/conditions`,
        conditionsKey: QUERY_KEYS.regionConditions(place.idRegion)
      };
