import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useApiGetConditionsAt } from './useApiGetConditionsAt';

const track = vi.fn();
const apiPost = vi.fn();
const getForecastWindow = vi.fn();

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('@web/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@web/shared/api')>()),
  apiPost: (...args: unknown[]) => apiPost(...args),
  getForecastWindow: (...args: unknown[]) => getForecastWindow(...args)
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const coords = { lat: 48.6812, lng: 26.5634 };

describe('useApiGetConditionsAt', () => {
  beforeEach(() => {
    track.mockClear();
    apiPost.mockReset().mockResolvedValue({ hasPoint: true, days: [] });
    getForecastWindow.mockReset();
  });

  it('scores sun and shade alone when the forecast fails, and reports it', async () => {
    getForecastWindow.mockRejectedValue({
      kind: 'domain',
      code: 'WEATHER_FETCH_FAILED',
      message: 'refused'
    });

    const { result } = renderHook(
      () =>
        useApiGetConditionsAt({
          path: '/sectors/s1/conditions',
          queryKey: ['c'],
          coords
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.conditions).not.toBeNull());

    expect(apiPost).toHaveBeenCalledWith('/sectors/s1/conditions', {
      forecast: null
    });
    expect(track).toHaveBeenCalledWith({
      name: 'Weather Load Failed',
      props: {
        context: 'conditions',
        code: 'WEATHER_FETCH_FAILED',
        provider: 'open-meteo'
      }
    });
  });

  it('asks the provider once for sectors sharing a grid cell', async () => {
    getForecastWindow.mockResolvedValue({ time: [] });

    const { result } = renderHook(
      () => [
        useApiGetConditionsAt({
          path: '/sectors/s1/conditions',
          queryKey: ['a'],
          coords
        }),
        useApiGetConditionsAt({
          path: '/sectors/s2/conditions',
          queryKey: ['b'],
          coords: { lat: 48.6849, lng: 26.5601 }
        })
      ],
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.every((one) => one.conditions)).toBe(true)
    );

    expect(getForecastWindow).toHaveBeenCalledTimes(1);
  });
});
