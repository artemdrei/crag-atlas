import type { ConditionsPlace } from '../entities';
import { placeSourceOf } from '../lib';
import { useApiGetConditionsAt } from './useApiGetConditionsAt';
import { useApiGetPlaceCoords } from './useApiGetPlaceCoords';

export const useApiGetPlaceForecast = (place: ConditionsPlace) => {
  const { conditionsPath, conditionsKey } = placeSourceOf(place);
  const { coords, isLoaded } = useApiGetPlaceCoords(place);

  // The conditions query is cached by place alone, so firing it before the
  // pin is known would store a reading without a forecast.
  return useApiGetConditionsAt({
    path: conditionsPath,
    queryKey: conditionsKey,
    coords,
    enabled: isLoaded
  });
};
