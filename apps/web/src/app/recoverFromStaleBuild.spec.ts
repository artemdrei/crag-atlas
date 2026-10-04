import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { recoverFromStaleBuild } from './recoverFromStaleBuild';

const RELOADED_KEY = `stale-build-reloaded:${__APP_VERSION__}`;

const failChunkLoad = () => {
  const event = new Event('vite:preloadError', { cancelable: true });

  window.dispatchEvent(event);

  return event;
};

describe('recoverFromStaleBuild', () => {
  beforeAll(() => {
    recoverFromStaleBuild();
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('reloads once when a chunk of the previous build is gone', () => {
    const event = failChunkLoad();

    expect(event.defaultPrevented).toBe(true);
    expect(sessionStorage.getItem(RELOADED_KEY)).toBe('1');
  });

  it('does not reload again on the same version', () => {
    failChunkLoad();
    const second = failChunkLoad();

    expect(second.defaultPrevented).toBe(false);
  });

  it('still recovers after a reload on an earlier version', () => {
    sessionStorage.setItem('stale-build-reloaded:0.0.0-earlier', '1');

    expect(failChunkLoad().defaultPrevented).toBe(true);
  });
});
