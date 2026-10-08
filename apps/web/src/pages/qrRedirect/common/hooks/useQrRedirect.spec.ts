import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useQrRedirect } from './useQrRedirect';

const track = vi.fn();
const resolved = {
  target: null as null | Record<string, string>,
  isLoading: false,
  failure: null as unknown
};

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('react-router', () => ({
  useParams: () => ({ '*': 'ua/kamianets/dalnij' })
}));
vi.mock('@web/features/sectorQr', () => ({
  useApiResolveQrPath: () => resolved
}));
vi.mock('@web/app/router/routes', () => ({
  buildSectorPath: (idRegion: string, idSector: string) =>
    `/regions/${idRegion}/sectors/${idSector}`
}));

describe('useQrRedirect', () => {
  beforeEach(() => {
    track.mockClear();
    resolved.target = null;
    resolved.isLoading = false;
    resolved.failure = null;
  });

  it('reports a scan that opened a sector, with its names, once', () => {
    resolved.target = {
      idRegion: 'r1',
      idSector: 's1',
      regionName: 'Kamianets',
      sectorName: "Dal'nij"
    };

    const { rerender } = renderHook(() => useQrRedirect());

    rerender();

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith({
      name: 'QR Code Scanned',
      props: {
        result: 'opened',
        qr_path: 'ua/kamianets/dalnij',
        id_region: 'r1',
        id_sector: 's1',
        region_name: 'Kamianets',
        sector_name: "Dal'nij"
      }
    });
  });

  it('reports a code that leads nowhere', () => {
    resolved.failure = { kind: 'domain', code: 'QR_PATH_NOT_FOUND' };

    renderHook(() => useQrRedirect());

    expect(track).toHaveBeenCalledWith({
      name: 'QR Code Scanned',
      props: { result: 'not_found', qr_path: 'ua/kamianets/dalnij' }
    });
  });

  it('waits while the code is being resolved', () => {
    resolved.isLoading = true;

    renderHook(() => useQrRedirect());

    expect(track).not.toHaveBeenCalled();
  });
});
