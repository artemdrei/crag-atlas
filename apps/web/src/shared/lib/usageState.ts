import { createPersistedStore } from './persistedStore';

export interface UsageState {
  firstSeenAt?: number;
  lastSessionAt?: number;
  sessionsCount: number;
  lastPromptAt?: number;
}

const store = createPersistedStore<UsageState>('crag-atlas:usage', {
  sessionsCount: 0
});

export const getUsageState = store.get;
export const subscribeUsageState = store.subscribe;

const isSameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const recordUsageSession = (now = Date.now()) => {
  const { firstSeenAt, lastSessionAt, sessionsCount } = store.get();

  if (lastSessionAt && isSameDay(lastSessionAt, now)) return;

  store.write({
    firstSeenAt: firstSeenAt ?? now,
    lastSessionAt: now,
    sessionsCount: sessionsCount + 1
  });
};

// Two asks in one sitting is one too many, whichever feature asks.
export const recordPromptShown = (now = Date.now()) =>
  store.write({ lastPromptAt: now });

export const wasPromptShownToday = (state: UsageState, now = Date.now()) =>
  !!state.lastPromptAt && isSameDay(state.lastPromptAt, now);
