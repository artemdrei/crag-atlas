import type { TickWeather } from '@crag-atlas/api';
import { domainFailure, type Failure } from '@crag-atlas/utils';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Params, useTickConditions } from './useTickConditions';

interface Lookup {
  weather: TickWeather | null;
  hasPoint: boolean;
  isLoading: boolean;
  isOffline: boolean;
  failure: Failure | null;
}

let lookup: Lookup;

vi.mock('./useApiGetWeather', () => ({
  useApiGetWeather: () => lookup
}));

const STORED: TickWeather = {
  observedAt: '2026-10-01T16:00',
  lat: 46.5,
  lng: 14,
  temperatureC: 18,
  humidityPct: 40,
  windSpeedMs: 2,
  isManual: false
};

const renderConditions = (params: Partial<Params> = {}) =>
  renderHook((props: Params) => useTickConditions(props), {
    initialProps: {
      climbedAt: '2026-10-01',
      climbedAtTime: '16:30',
      stored: STORED,
      ...params
    }
  });

describe('useTickConditions', () => {
  beforeEach(() => {
    lookup = {
      weather: null,
      hasPoint: true,
      isLoading: false,
      isOffline: false,
      failure: null
    };
  });

  it('sends the stored reading back while the hour is unchanged', () => {
    const { result } = renderConditions();

    expect(result.current.weather).toEqual(STORED);
  });

  it('leaves the stored reading alone when the lookup for a new date fails', () => {
    lookup.failure = domainFailure('WEATHER_FETCH_FAILED', 'Unreachable');

    const { result } = renderConditions({ climbedAt: '2026-10-02' });

    expect(result.current.weather).toBeUndefined();
    expect(result.current.failure).toBe(lookup.failure);
  });

  it('leaves the stored reading alone while the lookup is running', () => {
    lookup.isLoading = true;

    const { result } = renderConditions({ climbedAt: '2026-10-02' });

    expect(result.current.weather).toBeUndefined();
  });

  it('clears the reading once every field is emptied', () => {
    const { result } = renderConditions();

    act(() => {
      result.current.setField('temperatureC', null);
      result.current.setField('humidityPct', null);
      result.current.setField('windSpeedMs', null);
    });

    expect(result.current.weather).toBeNull();
  });

  it('keeps a reading with only some fields emptied', () => {
    const { result } = renderConditions();

    act(() => result.current.setField('windSpeedMs', null));

    expect(result.current.weather).toMatchObject({
      temperatureC: 18,
      windSpeedMs: null,
      isManual: true
    });
  });

  it('flags corrections dropped by a change of hour', () => {
    const { result, rerender } = renderConditions();

    act(() => result.current.setField('temperatureC', 12));

    rerender({
      climbedAt: '2026-10-01',
      climbedAtTime: '18:00',
      stored: STORED
    });

    expect(result.current.isEditsReset).toBe(true);
    expect(result.current.isEdited('temperatureC')).toBe(false);
  });

  it('matches a reading backfilled for an ascent logged without a time', () => {
    const { result } = renderConditions({
      climbedAtTime: '',
      stored: { ...STORED, observedAt: '2026-10-01T14:00' }
    });

    expect(result.current.weather).toMatchObject({
      observedAt: '2026-10-01T14:00'
    });
  });
});
