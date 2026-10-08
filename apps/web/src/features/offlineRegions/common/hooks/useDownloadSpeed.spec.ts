import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDownloadSpeed } from './useDownloadSpeed';

const KB = 1024;

describe('useDownloadSpeed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
  });

  afterEach(() => vi.useRealTimers());

  it('is idle without a download', () => {
    const { result } = renderHook(() => useDownloadSpeed(null));

    expect(result.current).toEqual({ bytesPerSecond: null, isSlow: false });
  });

  it('measures bytes against the time since the download started', () => {
    const { result } = renderHook(() =>
      useDownloadSpeed({ done: 1, total: 2, bytes: 400 * KB, startedAt: 8_000 })
    );

    expect(result.current.bytesPerSecond).toBe(200 * KB);
    expect(result.current.isSlow).toBe(false);
  });

  it('calls a crawl slow only after the warm-up', () => {
    const progress = { done: 0, total: 5, bytes: 50 * KB, startedAt: 9_000 };
    const { result } = renderHook(() => useDownloadSpeed(progress));

    expect(result.current.isSlow).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current.isSlow).toBe(true);
  });
});
