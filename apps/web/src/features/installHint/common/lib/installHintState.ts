import type { UsageState } from '@web/shared/lib';
import { createPersistedStore } from '@web/shared/lib';

export interface InstallHintState {
  momentAt?: number;
  shownAt?: number;
  shownCount: number;
  isInstalled?: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const RETURNING_AFTER_MS = DAY_MS;
const RETURNING_SESSIONS = 2;
const SHOW_COOLDOWN_MS = 3 * DAY_MS;
const MAX_SHOWN = 5;

const store = createPersistedStore<InstallHintState>(
  'crag-atlas:install-hint',
  { shownCount: 0 }
);

export const getInstallHintState = store.get;
export const subscribeInstallHintState = store.subscribe;

export const recordInstallHintMoment = (now = Date.now()) => {
  if (store.get().momentAt) return;

  store.write({ momentAt: now });
};

export const recordInstallHintShown = (now = Date.now()) =>
  store.write({ shownAt: now, shownCount: store.get().shownCount + 1 });

export const markInstallHintInstalled = () =>
  store.write({ isInstalled: true });

export const shouldShowInstallHint = (
  state: InstallHintState,
  usage: UsageState,
  now = Date.now()
) => {
  if (state.isInstalled || !state.momentAt || !usage.firstSeenAt) return false;
  if (state.shownCount >= MAX_SHOWN) return false;

  const isReturning =
    usage.sessionsCount >= RETURNING_SESSIONS &&
    now - usage.firstSeenAt >= RETURNING_AFTER_MS;
  const isCoolingDown =
    !!state.shownAt && now - state.shownAt < SHOW_COOLDOWN_MS;

  return isReturning && !isCoolingDown;
};
