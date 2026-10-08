import { describe, expect, it } from 'vitest';

import {
  type InstallHintState,
  shouldShowInstallHint
} from './installHintState';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 10 * DAY;

const returning: InstallHintState = {
  firstSeenAt: NOW - 2 * DAY,
  sessionsCount: 2,
  shownCount: 0,
  momentAt: NOW
};

describe('shouldShowInstallHint', () => {
  it('shows a returning climber who just had a moment', () => {
    expect(shouldShowInstallHint(returning, NOW)).toBe(true);
  });

  it('waits for a moment worth installing for', () => {
    expect(
      shouldShowInstallHint({ ...returning, momentAt: undefined }, NOW)
    ).toBe(false);
  });

  it('waits for a second visit on another day', () => {
    expect(shouldShowInstallHint({ ...returning, sessionsCount: 1 }, NOW)).toBe(
      false
    );
    expect(
      shouldShowInstallHint({ ...returning, firstSeenAt: NOW - DAY / 2 }, NOW)
    ).toBe(false);
  });

  it('rests three days after a showing', () => {
    expect(
      shouldShowInstallHint({ ...returning, shownAt: NOW - 2 * DAY }, NOW)
    ).toBe(false);
    expect(
      shouldShowInstallHint({ ...returning, shownAt: NOW - 4 * DAY }, NOW)
    ).toBe(true);
  });

  it('gives up after five showings', () => {
    expect(shouldShowInstallHint({ ...returning, shownCount: 4 }, NOW)).toBe(
      true
    );
    expect(shouldShowInstallHint({ ...returning, shownCount: 5 }, NOW)).toBe(
      false
    );
  });

  it('stays quiet once installed', () => {
    expect(
      shouldShowInstallHint({ ...returning, isInstalled: true }, NOW)
    ).toBe(false);
  });
});
