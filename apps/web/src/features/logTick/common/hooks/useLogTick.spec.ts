import { createElement, type ReactNode } from 'react';

import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';

import { useLogTick } from './useLogTick';

const track = vi.fn();
const celebrate = vi.fn();
const toastError = vi.fn();
const createTick = vi.fn();
let onCreated: (tick: unknown) => Promise<void> = async () => {};

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));
vi.mock('@web/app/providers', () => ({
  useModal: () => ({ closeModal: vi.fn() })
}));
vi.mock('@web/features/installHint', () => ({
  recordInstallHintMoment: vi.fn()
}));
vi.mock('@web/shared/api', () => ({
  invalidateRouteLists: vi.fn(),
  QUERY_KEYS: { routeMedia: () => [], ticks: () => [] }
}));
vi.mock('@web/shared/lib', () => ({
  celebrate: (name: string) => celebrate(name),
  toast: { success: vi.fn(), error: (message: string) => toastError(message) },
  useIsOnline: () => navigator.onLine
}));
vi.mock('../lib', async () => ({
  ...(await vi.importActual<typeof import('../lib')>('../lib')),
  saveTickMedia: vi.fn()
}));
vi.mock('./useApiCreateTick', () => ({
  useApiCreateTick: (params: { onCreated: typeof onCreated }) => {
    onCreated = params.onCreated;

    return { isPending: false, createTick };
  }
}));

i18n.load('en', {});
i18n.activate('en');

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(I18nProvider, { i18n }, children);

describe('useLogTick', () => {
  beforeEach(() => {
    track.mockClear();
    celebrate.mockClear();
    toastError.mockClear();
    createTick.mockClear();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  it('reports the ascent with its conditions and what was attached', async () => {
    const { result } = renderHook(() => useLogTick('route'), { wrapper });

    act(() =>
      result.current.save(
        { ascentType: 'redpoint' },
        {
          links: ['https://youtu.be/dQw4w9WgXcQ'],
          files: [new File([''], 'a.jpg'), new File([''], 'b.jpg')]
        }
      )
    );
    await act(() =>
      onCreated({
        id: 't1',
        ascentType: 'redpoint',
        note: 'Good',
        rating: 4,
        gradeVote: null,
        weather: { observedAt: '2026-10-01T16:00', isManual: true }
      })
    );

    expect(track).toHaveBeenCalledWith({
      name: 'Tick Logged',
      props: {
        ascent_type: 'redpoint',
        id_route: 'route',
        has_note: true,
        has_rating: true,
        has_partner: false,
        has_grade_vote: false,
        has_weather: true,
        weather_edited: true,
        photo_count: 2,
        video_count: 1
      }
    });
  });

  it('celebrates a first send', async () => {
    renderHook(() => useLogTick('route'), { wrapper });

    await act(() =>
      onCreated({ id: 't1', ascentType: 'flash', isRepeat: false })
    );

    expect(celebrate).toHaveBeenCalledWith('confetti');
  });

  it('stays quiet on a repeat', async () => {
    renderHook(() => useLogTick('route'), { wrapper });

    await act(() =>
      onCreated({ id: 't1', ascentType: 'redpoint', isRepeat: true })
    );

    expect(celebrate).not.toHaveBeenCalled();
  });

  it('refuses to log while offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useLogTick('route'), { wrapper });

    act(() =>
      result.current.save({ ascentType: 'flash' }, { links: [], files: [] })
    );

    expect(createTick).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      'No internet connection. Log the ascent again once you are back online'
    );
  });
});
