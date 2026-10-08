import {
  getForecastDay,
  OPEN_METEO,
  QUERY_KEYS,
  useApiQuery
} from '@web/shared/api';
import { trackWeatherFailure, useIsOnline } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

import { tickWeatherAt } from '../lib';

export interface Params {
  coords?: Coords;
  at: string;
  enabled?: boolean;
}

// Keyed by the day, so moving the hour picks another reading from the same
// answer instead of asking again.
export const useApiGetWeather = ({ coords, at, enabled = true }: Params) => {
  const isOnline = useIsOnline();
  const date = at.slice(0, 10);

  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.forecastDay(coords, date),
    queryFn: async () =>
      coords
        ? getForecastDay(coords, date).catch((error: unknown) => {
            trackWeatherFailure('tick', OPEN_METEO, error);
            throw error;
          })
        : null,
    enabled: enabled && isOnline && !!coords && !!date
  });

  return {
    weather: data && coords ? tickWeatherAt(data, coords, at) : null,
    hasPoint: !!coords,
    isLoading,
    isOffline: !isOnline,
    failure
  };
};
