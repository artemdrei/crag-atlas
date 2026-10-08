import type { SectorConditions } from '@crag-atlas/api';
import { useQueryClient } from '@tanstack/react-query';

import {
  apiPost,
  getForecastWindow,
  OPEN_METEO,
  QUERY_KEYS,
  useApiQuery
} from '@web/shared/api';
import { trackWeatherFailure, useIsOnline } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

export interface Params {
  path: string;
  queryKey: readonly unknown[];
  coords?: Coords;
}

// The provider refreshes hourly, and sectors of one crag share its grid cell.
const FORECAST_FRESH_MS = 15 * 60 * 1000;

export const useApiGetConditionsAt = ({ path, queryKey, coords }: Params) => {
  const isOnline = useIsOnline();
  const queryClient = useQueryClient();

  // A forecast that could not be fetched still leaves sun and shade worth
  // showing, so it is sent as missing rather than failing the whole card.
  const forecastAt = (point: Coords) =>
    queryClient
      .fetchQuery({
        queryKey: QUERY_KEYS.forecastWindow(point),
        queryFn: () => getForecastWindow(point),
        staleTime: FORECAST_FRESH_MS
      })
      .catch((error: unknown) => {
        trackWeatherFailure('conditions', OPEN_METEO, error);

        return null;
      });

  const { data, isLoading, failure } = useApiQuery({
    queryKey,
    queryFn: async () =>
      apiPost<SectorConditions>(path, {
        forecast: coords ? await forecastAt(coords) : null
      }),
    enabled: isOnline
  });

  return {
    conditions: data ?? null,
    isLoading,
    isOffline: !isOnline && !data,
    failure
  };
};
