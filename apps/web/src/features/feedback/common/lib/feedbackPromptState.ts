import { createPersistedStore } from '@web/shared/lib';

export interface FeedbackPromptState {
  shownAt?: number;
  shownCount: number;
  sentAt?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ASK_FROM_DAY = 3;
const ASK_AGAIN_AFTER_MS = 14 * DAY_MS;
const MAX_SHOWN = 3;

const store = createPersistedStore<FeedbackPromptState>(
  'crag-atlas:feedback-prompt',
  { shownCount: 0 }
);

export const getFeedbackPromptState = store.get;
export const subscribeFeedbackPromptState = store.subscribe;

export const recordFeedbackPromptShown = (now = Date.now()) =>
  store.write({ shownAt: now, shownCount: store.get().shownCount + 1 });

export const markFeedbackSent = (now = Date.now()) =>
  store.write({ sentAt: now });

export const shouldShowFeedbackPrompt = (
  state: FeedbackPromptState,
  daysUsed: number,
  now = Date.now()
) => {
  if (state.sentAt || state.shownCount >= MAX_SHOWN) return false;
  if (daysUsed < ASK_FROM_DAY) return false;

  return !state.shownAt || now - state.shownAt >= ASK_AGAIN_AFTER_MS;
};
