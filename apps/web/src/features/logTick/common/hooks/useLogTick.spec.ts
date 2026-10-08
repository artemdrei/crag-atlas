import { createElement, type ReactNode } from 'react';

import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';

import { useLogTick } from './useLogTick';

const track = vi.fn();
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
vi.mock('@web/shared/lib', () => ({ toast: { success: vi.fn() } }));
vi.mock('../lib', () => ({ saveTickMedia: vi.fn() }));
vi.mock('./useApiCreateTick', () => ({
  useApiCreateTick: (params: { onCreated: typeof onCreated }) => {
    onCreated = params.onCreated;

    return { isPending: false, createTick: vi.fn() };
  }
}));

i18n.load('en', {});
i18n.activate('en');

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(I18nProvider, { i18n }, children);

describe('useLogTick', () => {
  beforeEach(() => track.mockClear());

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
});
