import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useVideoActions } from './useVideoActions';

const track = vi.fn();
const openModal = vi.fn();
const navigate = vi.fn();
let user = { idUser: 'me', isAuthenticated: true, isAdmin: false };

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@web/app/providers', () => ({
  useModal: () => ({ openModal }),
  useUser: () => ({
    idUser: user.idUser,
    isAuthenticated: user.isAuthenticated,
    hasRole: () => user.isAdmin
  })
}));
vi.mock('@web/app/router/useSignInLink', () => ({
  useSignInLink: () => ({ to: '/login', from: '/media' })
}));

const video = (idUser: string) =>
  ({ id: 'media-1', idUser, route: { idRoute: 'route-1' } }) as never;

describe('useVideoActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user = { idUser: 'me', isAuthenticated: true, isAdmin: false };
  });

  it('opens the add form for a member', () => {
    const { result } = renderHook(() => useVideoActions());

    result.current.addVideo();

    expect(openModal).toHaveBeenCalledWith('VIDEO_ADD');
    expect(track).not.toHaveBeenCalled();
  });

  it('sends a guest to sign in and reports the prompt', () => {
    user = { idUser: '', isAuthenticated: false, isAdmin: false };
    const { result } = renderHook(() => useVideoActions());

    result.current.addVideo();

    expect(openModal).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login', {
      state: { from: '/media' }
    });
    expect(track).toHaveBeenCalledWith({
      name: 'Sign In Prompted',
      props: { action: 'video' }
    });
  });

  it('plays a video marked as opened from the gallery', () => {
    const { result } = renderHook(() => useVideoActions());

    result.current.playVideo(video('someone'));

    expect(openModal).toHaveBeenCalledWith(
      'ROUTE_MEDIA_VIEW',
      { idRoute: 'route-1', idMedia: 'media-1' },
      { source: 'media' }
    );
  });

  it('lets the author or an admin delete, nobody else', () => {
    const { result, rerender } = renderHook(() => useVideoActions());

    expect(result.current.canDelete(video('me'))).toBe(true);
    expect(result.current.canDelete(video('someone'))).toBe(false);

    user = { ...user, isAdmin: true };
    rerender();

    expect(result.current.canDelete(video('someone'))).toBe(true);
  });
});
