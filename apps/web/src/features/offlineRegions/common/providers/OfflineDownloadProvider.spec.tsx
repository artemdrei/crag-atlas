import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OfflineDownloadProvider,
  useOfflineDownload
} from './OfflineDownloadProvider';

const track = vi.fn();
const downloadRegion = vi.fn();
let saved: Record<string, unknown> = {};

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('@web/app/providers', () => ({
  useUser: () => ({ isAuthenticated: true })
}));
vi.mock('@web/features/installHint', () => ({
  recordInstallHintMoment: vi.fn()
}));
vi.mock('../lib', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib')>()),
  downloadRegion: (...args: unknown[]) => downloadRegion(...args),
  readOfflineRegions: async () => saved
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <OfflineDownloadProvider>{children}</OfflineDownloadProvider>
  </QueryClientProvider>
);

const actionsOf = () =>
  track.mock.calls.map(([event]) => event.props.action as string);

describe('OfflineDownloadProvider analytics', () => {
  beforeEach(() => {
    track.mockClear();
    downloadRegion.mockReset();
    saved = {};
  });

  it('reports a save from start to finish with its size', async () => {
    downloadRegion.mockImplementation(async (_id, _ticks, onProgress) => {
      onProgress({ done: 3, total: 3, bytes: 900, startedAt: Date.now() });

      return { bytes: 1200 };
    });
    const { result } = renderHook(() => useOfflineDownload(), { wrapper });

    await act(() => result.current.downloadRegion('r1', 'header'));

    expect(actionsOf()).toEqual(['save_started', 'save_completed']);
    expect(track).toHaveBeenLastCalledWith({
      name: 'Offline Region Action',
      props: expect.objectContaining({
        action: 'save_completed',
        id_region: 'r1',
        source: 'header',
        photo_count: 3,
        bytes: 1200
      })
    });
  });

  it('reports a saved region downloaded again as a refresh', async () => {
    saved = { r1: { id: 'r1' } };
    downloadRegion.mockResolvedValue({ bytes: 10 });
    const { result } = renderHook(() => useOfflineDownload(), { wrapper });

    await act(() => result.current.downloadRegion('r1', 'profile'));

    expect(actionsOf()).toEqual(['refreshed']);
  });

  it('reports a failed save with its code', async () => {
    downloadRegion.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useOfflineDownload(), { wrapper });

    await act(() =>
      result.current.downloadRegion('r1', 'profile').catch(() => {})
    );

    expect(actionsOf()).toEqual(['save_started', 'save_failed']);
    expect(track).toHaveBeenLastCalledWith({
      name: 'Offline Region Action',
      props: expect.objectContaining({ code: expect.any(String) })
    });
  });
});
