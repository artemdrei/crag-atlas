import type { WeatherLookup } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

export interface Params {
  idRoute: string;
  at: string;
  enabled?: boolean;
}

export const useApiGetWeather = ({ idRoute, at, enabled = true }: Params) => {
  const { data, isLoading } = useApiQuery<WeatherLookup>({
    queryKey: QUERY_KEYS.weather(idRoute, at),
    queryFn: () =>
      apiGet<WeatherLookup>(
        `/weather?idRoute=${idRoute}&at=${encodeURIComponent(at)}`
      ),
    enabled: enabled && !!idRoute && !!at
  });

  return {
    weather: data?.weather ?? null,
    // Assumed until the answer arrives, so a slow lookup never disables the
    // fields on someone who wants to type the numbers in.
    hasPoint: data?.hasPoint ?? true,
    isLoading
  };
};
