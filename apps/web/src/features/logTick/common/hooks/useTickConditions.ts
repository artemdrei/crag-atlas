import { useState } from 'react';

import type { TickWeather } from '@crag-atlas/api';

import { observedHour } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

import { useApiGetWeather } from './useApiGetWeather';

const EDITABLE_FIELDS = [
  'temperatureC',
  'humidityPct',
  'windSpeedMs'
] as const satisfies readonly (keyof TickWeather)[];

export type WeatherFieldName = (typeof EDITABLE_FIELDS)[number];

export interface Params {
  coords?: Coords;
  climbedAt: string;
  climbedAtTime: string;
  stored?: TickWeather | null;
}

export const useTickConditions = ({
  coords,
  climbedAt,
  climbedAtTime,
  stored
}: Params) => {
  const at = observedHour(climbedAt, climbedAtTime);
  const [edits, setEdits] = useState<Partial<TickWeather>>({});
  const [lastAt, setLastAt] = useState(at);
  const [isEditsReset, setIsEditsReset] = useState(false);

  // A correction belongs to the hour it was typed for, and describes nothing
  // once that hour moves.
  if (lastAt !== at) {
    setLastAt(at);
    setEdits({});

    if (Object.keys(edits).length > 0) setIsEditsReset(true);
  }

  const isStoredHour = stored?.observedAt === at;

  const { weather, hasPoint, isLoading, isOffline, failure } = useApiGetWeather(
    {
      coords,
      at,
      enabled: !isStoredHour
    }
  );

  const base = isStoredHour ? stored : weather;
  const conditions = toConditions(base, edits, at);

  return {
    conditions,
    weather: toPayload(conditions, edits),
    failure: isStoredHour ? null : failure,
    hasPoint: isStoredHour ? stored.lat != null : hasPoint,
    isLoading: isLoading && !base,
    isOffline: isOffline && !base,
    isEditsReset,
    isEdited: (field: WeatherFieldName) => field in edits,
    setField: (field: WeatherFieldName, value: number | null) => {
      setIsEditsReset(false);
      setEdits((current) => ({ ...current, [field]: value }));
    },
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

// `null` deletes the stored reading and `undefined` leaves it alone, so only a
// climber emptying the fields may produce the former — a lookup that failed or
// is still running must not wipe what was saved.
const toPayload = (
  conditions: TickWeather | null,
  edits: Partial<TickWeather>
): TickWeather | null | undefined => {
  if (!conditions) return undefined;

  const isCleared =
    EDITABLE_FIELDS.some((field) => field in edits) &&
    EDITABLE_FIELDS.every((field) => conditions[field] == null);

  return isCleared ? null : conditions;
};
