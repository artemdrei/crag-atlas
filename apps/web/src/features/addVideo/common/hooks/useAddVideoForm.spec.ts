import { createElement, type ReactNode } from 'react';

import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';

import { useAddVideoForm } from './useAddVideoForm';

interface Preview {
  title: string | null;
  suggestedRoute: object | null;
  existing: object | null;
}

const track = vi.fn();
const closeModal = vi.fn();
const navigate = vi.fn();
const createVideo = vi.fn();
let onCreated: (media: { id: string }) => void = () => {};
let previewState: {
  preview?: Preview;
  isLoading: boolean;
  failure: object | null;
} = { isLoading: false, failure: null };

const SUGGESTED = { idRoute: 'suggested', name: 'Pyrih' };
const PICKED = { idRoute: 'picked', name: 'Arka' };
const EXISTING = {
  id: 'media-1',
  route: { idRegion: 'r', idSector: 's', idRoute: 'held' }
};
const LINK = 'https://youtu.be/dQw4w9WgXcQ';

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@web/app/providers', () => ({ useModal: () => ({ closeModal }) }));
vi.mock('@web/app/router/routes', () => ({
  buildMediaAddedPath: (id: string) => `/media?added=${id}`,
  buildRoutePath: (...ids: string[]) => `/${ids.join('/')}`
}));
vi.mock('@web/shared/api', () => ({
  useApiGetVideoPreview: (link: unknown) =>
    link ? previewState : { isLoading: false, failure: null }
}));
vi.mock('@web/shared/lib', async () => ({
  parseMediaLink: (
    await vi.importActual<typeof import('@web/shared/lib/mediaLink')>(
      '@web/shared/lib/mediaLink'
    )
  ).parseMediaLink,
  toast: { success: vi.fn(), error: vi.fn() }
}));
vi.mock('./useApiCreateVideo', () => ({
  useApiCreateVideo: (params: { onCreated: typeof onCreated }) => {
    onCreated = params.onCreated;

    return { isPending: false, createVideo };
  }
}));

i18n.load('en', {});
i18n.activate('en');

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(I18nProvider, { i18n }, children);

const render = () => renderHook(() => useAddVideoForm(), { wrapper });

const previewOf = (overrides: Partial<Preview> = {}): Preview => ({
  title: 'Pyrih 6c+',
  suggestedRoute: null,
  existing: null,
  ...overrides
});

const linkChecks = () =>
  track.mock.calls
    .map(([event]) => event)
    .filter(({ name }) => name === 'Video Link Checked');

describe('useAddVideoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    previewState = { isLoading: false, failure: null };
  });

  it('reads nothing while the link is still being typed', () => {
    const { result } = render();

    act(() => result.current.changeDraft('https://youtu.be/dQw4w'));

    expect(result.current.draft).toBe('https://youtu.be/dQw4w');
    expect(result.current.isUnsupported).toBe(false);
    expect(result.current.preview).toBeUndefined();
  });

  it('flags a committed link that is not YouTube and reports it', () => {
    const { result } = render();

    act(() => result.current.commitLink(' https://vimeo.com/1 '));

    expect(result.current.isUnsupported).toBe(true);
    expect(linkChecks()).toEqual([
      {
        name: 'Video Link Checked',
        props: { result: 'unsupported', has_suggestion: false }
      }
    ]);
  });

  it('submits the suggested route until another is picked', () => {
    previewState = {
      preview: previewOf({ suggestedRoute: SUGGESTED }),
      isLoading: false,
      failure: null
    };
    const { result } = render();

    act(() => result.current.commitLink(LINK));

    expect(result.current.isSuggested).toBe(true);
    expect(result.current.canSubmit).toBe(true);

    act(() => result.current.submit());

    expect(createVideo).toHaveBeenLastCalledWith({
      idRoute: 'suggested',
      url: LINK,
      title: 'Pyrih 6c+',
      isSuggested: true
    });

    act(() => result.current.pickRoute(PICKED as never));
    act(() => result.current.submit());

    expect(result.current.isSuggested).toBe(false);
    expect(createVideo).toHaveBeenLastCalledWith(
      expect.objectContaining({ idRoute: 'picked', isSuggested: false })
    );
  });

  it('asks for a route when none was suggested', () => {
    previewState = { preview: previewOf(), isLoading: false, failure: null };
    const { result } = render();

    act(() => result.current.commitLink(LINK));

    expect(result.current.isChoosingRoute).toBe(true);
    expect(result.current.canSubmit).toBe(false);

    act(() => result.current.submit());

    expect(createVideo).not.toHaveBeenCalled();
  });

  it('blocks a video the catalog already holds and leads to it', () => {
    previewState = {
      preview: previewOf({ existing: EXISTING }),
      isLoading: false,
      failure: null
    };
    const { result } = render();

    act(() => result.current.commitLink(LINK));

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.canPickRoute).toBe(false);
    expect(linkChecks()).toEqual([
      {
        name: 'Video Link Checked',
        props: { result: 'duplicate', has_suggestion: false }
      }
    ]);

    act(() => result.current.openExisting());

    expect(closeModal).toHaveBeenCalledWith('VIDEO_ADD', { isCompleted: true });
    expect(navigate).toHaveBeenCalledWith('/r/s/held');
  });

  it('reports a link whose preview failed', () => {
    previewState = { isLoading: false, failure: { kind: 'network' } };
    const { result } = render();

    act(() => result.current.commitLink(LINK));

    expect(linkChecks()).toEqual([
      {
        name: 'Video Link Checked',
        props: { result: 'failed', has_suggestion: false }
      }
    ]);
  });

  it('reports a link once, however often it is committed again', () => {
    previewState = {
      preview: previewOf({ suggestedRoute: SUGGESTED }),
      isLoading: false,
      failure: null
    };
    const { result } = render();

    act(() => result.current.commitLink(LINK));
    act(() => result.current.commitLink(LINK));

    expect(linkChecks()).toEqual([
      {
        name: 'Video Link Checked',
        props: { result: 'ok', has_suggestion: true }
      }
    ]);
  });

  it('closes as completed and opens the gallery on the new video', () => {
    render();

    act(() => onCreated({ id: 'media-2' }));

    expect(closeModal).toHaveBeenCalledWith('VIDEO_ADD', { isCompleted: true });
    expect(navigate).toHaveBeenCalledWith('/media?added=media-2');
  });

  it('closes as dismissed when the climber walks away', () => {
    const { result } = render();

    act(() => result.current.close());

    expect(closeModal).toHaveBeenCalledWith('VIDEO_ADD');
  });

  it('starts over when the link is cleared', () => {
    previewState = {
      preview: previewOf({ suggestedRoute: SUGGESTED }),
      isLoading: false,
      failure: null
    };
    const { result } = render();

    act(() => result.current.commitLink(LINK));
    act(() => result.current.pickRoute(PICKED as never));
    act(() => result.current.clearLink());

    expect(result.current.draft).toBe('');
    expect(result.current.route).toBeNull();
  });
});
