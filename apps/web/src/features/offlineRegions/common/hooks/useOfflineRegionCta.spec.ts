import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOfflineRegionCta } from './useOfflineRegionCta';

const openModal = vi.fn();
const reset = vi.fn();
const state = {
  isOnline: true,
  offlineRegions: [] as { id: string }[],
  isLoading: false,
  idDownloading: null as string | null,
  progress: null as { done: number; total: number } | null
};

vi.mock('@web/app/providers', () => ({ useModal: () => ({ openModal }) }));
vi.mock('@web/shared/lib', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@web/shared/lib')>()),
  useIsOnline: () => state.isOnline
}));
vi.mock('./useOfflineRegions', () => ({
  useOfflineRegions: () => ({
    offlineRegions: state.offlineRegions,
    isLoading: state.isLoading
  })
}));
vi.mock('../providers', () => ({
  useOfflineDownload: () => ({
    idDownloading: state.idDownloading,
    progress: state.progress,
    reset
  })
}));

describe('useOfflineRegionCta', () => {
  beforeEach(() => {
    openModal.mockClear();
    reset.mockClear();
    state.isOnline = true;
    state.offlineRegions = [];
    state.isLoading = false;
    state.idDownloading = null;
    state.progress = null;
  });

  it('shows for a region not yet saved', () => {
    const { result } = renderHook(() => useOfflineRegionCta('r1'));

    expect(result.current.isVisible).toBe(true);
  });

  it('hides once the region is saved', () => {
    state.offlineRegions = [{ id: 'r1' }];
    const { result } = renderHook(() => useOfflineRegionCta('r1'));

    expect(result.current.isVisible).toBe(false);
  });

  it('hides with no connection', () => {
    state.isOnline = false;
    const { result } = renderHook(() => useOfflineRegionCta('r1'));

    expect(result.current.isVisible).toBe(false);
  });

  it('hides until the saved list is known', () => {
    state.isLoading = true;
    const { result } = renderHook(() => useOfflineRegionCta('r1'));

    expect(result.current.isVisible).toBe(false);
  });

  it('reports the progress of its own download only', () => {
    state.idDownloading = 'r1';
    state.progress = { done: 1, total: 4 };

    expect(renderHook(() => useOfflineRegionCta('r1')).result.current).toEqual(
      expect.objectContaining({ isDownloading: true, progressPercent: 25 })
    );
    expect(renderHook(() => useOfflineRegionCta('r2')).result.current).toEqual(
      expect.objectContaining({ isDownloading: false, progressPercent: null })
    );
  });

  it('opens the modal and clears the last outcome', () => {
    renderHook(() => useOfflineRegionCta('r1')).result.current.open();

    expect(reset).toHaveBeenCalledOnce();
    expect(openModal).toHaveBeenCalledWith('SAVE_REGION_OFFLINE', {
      idRegion: 'r1'
    });
  });

  it('keeps a running download when reopened', () => {
    state.idDownloading = 'r1';
    renderHook(() => useOfflineRegionCta('r1')).result.current.open();

    expect(reset).not.toHaveBeenCalled();
    expect(openModal).toHaveBeenCalledOnce();
  });
});
