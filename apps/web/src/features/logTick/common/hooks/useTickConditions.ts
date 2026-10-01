import { useState } from 'react';

import type { TickWeather } from '@crag-atlas/api';

import { observedHour } from '@web/shared/lib';

import { useApiGetWeather } from './useApiGetWeather';

export type WeatherFieldName = keyof Pick<
  TickWeather,
  'temperatureC' | 'humidityPct' | 'windSpeedMs'
>;

export interface Params {
  idRoute: string;
  climbedAt: string;
  climbedAtTime: string;
  stored?: TickWeather | null;
}

export const useTickConditions = ({
  idRoute,
  climbedAt,
  climbedAtTime,
  stored
}: Params) => {
  const at = observedHour(climbedAt, climbedAtTime);
  const [edits, setEdits] = useState<Partial<TickWeather>>({});
  const [lastAt, setLastAt] = useState(at);

  // A correction belongs to the hour it was typed for, and describes nothing
  // once that hour moves.
  if (lastAt !== at) {
    setLastAt(at);
    setEdits({});
  }

  const isStoredHour = stored?.observedAt === at;

  const { weather, hasPoint, isLoading } = useApiGetWeather({
    idRoute,
    at,
    enabled: !isStoredHour
  });

  const base = isStoredHour ? stored : weather;

  return {
    conditions: toConditions(base, edits, at),
    hasPoint: isStoredHour ? stored.lat != null : hasPoint,
    isLoading: isLoading && !base,
    isEdited: (field: WeatherFieldName) => field in edits,
    setField: (field: WeatherFieldName, value: number | null) =>
      setEdits((current) => ({ ...current, [field]: value })),
    resetField: (field: WeatherFieldName) =>
      setEdits(({ [field]: _dropped, ...rest }) => rest)
  };
};

const toConditions = (
  base: TickWeather | null | undefined,
  edits: Partial<TickWeather>,
  at: string
): TickWeather | null => {
  const isEdited = Object.keys(edits).length > 0;

  if (!base) {
    return isEdited ? { observedAt: at, isManual: true, ...edits } : null;
  }

  return { ...base, ...edits, isManual: base.isManual || isEdited };
};
