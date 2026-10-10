import { useMemo } from 'react';

import type { SectorConditions } from '../entities';
import { nearestHour, weatherKindOf } from '../lib';

export const useCurrentWeather = (conditions: SectorConditions | null) =>
  useMemo(() => {
    const today = conditions?.hasPoint ? conditions.days[0] : undefined;
    const hour = today?.hasForecast
      ? nearestHour(today.hours, new Date())
      : null;

    if (hour?.temperatureC == null) return null;

    return {
      kind: weatherKindOf(hour.weatherCode, hour.precipitationMm),
      temperatureC: Math.round(hour.temperatureC)
    };
  }, [conditions]);
