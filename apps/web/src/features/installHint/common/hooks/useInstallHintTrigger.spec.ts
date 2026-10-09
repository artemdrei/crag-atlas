import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DAY = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'crag-atlas:install-hint';
const USAGE_KEY = 'crag-atlas:usage';

const openModal = vi.fn();
const getOpenedModals = vi.fn((): string[] => []);
const display = { isStandalone: false };
const user = { isAuthenticated: true };

vi.mock('@web/app/providers', () => ({
  useModal: () => ({ openModal, getOpenedModals }),
  useUser: () => user
}));

const seedReturning = () =>
  localStorage.setItem(
    USAGE_KEY,
    JSON.stringify({ firstSeenAt: Date.now() - 2 * DAY, sessionsCount: 1 })
  );

describe('useInstallHintTrigger', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    openModal.mockClear();
    getOpenedModals.mockReturnValue([]);
    display.isStandalone = false;
    user.isAuthenticated = true;
    vi.stubGlobal('matchMedia', () => ({ matches: display.isStandalone }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('stays quiet on the first visit even after a tick', async () => {
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    renderHook(() => useTrigger());

    recordMoment();

    expect(openModal).not.toHaveBeenCalled();
  });

  it('opens after a moment on a later visit', async () => {
    seedReturning();
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    const { rerender } = renderHook(() => useTrigger());

    expect(openModal).not.toHaveBeenCalled();

    recordMoment();
    rerender();

    expect(openModal).toHaveBeenCalledWith('INSTALL_HINT');
  });

  it('opens on the next visit after a first-visit moment', async () => {
    seedReturning();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ momentAt: Date.now() - 2 * DAY })
    );
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    renderHook(() => useTrigger());

    expect(openModal).toHaveBeenCalledWith('INSTALL_HINT');
  });

  it('counts the showing', async () => {
    seedReturning();
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    const { rerender } = renderHook(() => useTrigger());
    recordMoment();
    rerender();

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject(
      { shownCount: 1 }
    );
  });

  it('waits for the climber to sign in', async () => {
    seedReturning();
    user.isAuthenticated = false;
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    const { rerender } = renderHook(() => useTrigger());
    recordMoment();
    rerender();

    expect(openModal).not.toHaveBeenCalled();

    user.isAuthenticated = true;
    rerender();

    expect(openModal).toHaveBeenCalledWith('INSTALL_HINT');
  });

  it('waits while another sheet is up', async () => {
    seedReturning();
    getOpenedModals.mockReturnValue(['LOG_TICK']);
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    const { rerender } = renderHook(() => useTrigger());
    recordMoment();
    rerender();

    expect(openModal).not.toHaveBeenCalled();
  });

  it('waits a day after another prompt', async () => {
    seedReturning();
    localStorage.setItem(
      USAGE_KEY,
      JSON.stringify({
        firstSeenAt: Date.now() - 2 * DAY,
        sessionsCount: 1,
        lastPromptAt: Date.now()
      })
    );
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    const { rerender } = renderHook(() => useTrigger());
    recordMoment();
    rerender();

    expect(openModal).not.toHaveBeenCalled();
  });

  it('stays closed inside the installed app', async () => {
    seedReturning();
    display.isStandalone = true;
    const { useInstallHintTrigger: useTrigger } = await import(
      './useInstallHintTrigger'
    );
    const { recordInstallHintMoment: recordMoment } = await import('../lib');
    const { rerender } = renderHook(() => useTrigger());
    recordMoment();
    rerender();

    expect(openModal).not.toHaveBeenCalled();
  });
});
