import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstallHintTrigger } from './useInstallHintTrigger';

const openModal = vi.fn();
const display = { isStandalone: false };
const user = { isAuthenticated: true };

vi.mock('@web/app/providers', () => ({
  useModal: () => ({ openModal }),
  useUser: () => user
}));

describe('useInstallHintTrigger', () => {
  beforeEach(() => {
    localStorage.clear();
    openModal.mockClear();
    display.isStandalone = false;
    user.isAuthenticated = true;
    vi.stubGlobal('matchMedia', () => ({ matches: display.isStandalone }));
  });

  it('waits for the climber to sign in', () => {
    user.isAuthenticated = false;
    const { rerender } = renderHook(() => useInstallHintTrigger());

    expect(openModal).not.toHaveBeenCalled();

    user.isAuthenticated = true;
    rerender();

    expect(openModal).toHaveBeenCalledWith('INSTALL_HINT');
  });

  it('opens the hint on the first signed-in visit', () => {
    renderHook(() => useInstallHintTrigger());

    expect(openModal).toHaveBeenCalledWith('INSTALL_HINT');
  });

  it('does not open it again on the next visit', () => {
    renderHook(() => useInstallHintTrigger()).unmount();
    renderHook(() => useInstallHintTrigger());

    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('stays closed inside the installed app', () => {
    display.isStandalone = true;
    renderHook(() => useInstallHintTrigger());

    expect(openModal).not.toHaveBeenCalled();
  });
});
