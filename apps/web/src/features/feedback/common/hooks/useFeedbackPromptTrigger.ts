import { useEffect, useSyncExternalStore } from 'react';

import { useModal } from '@web/app/providers';
import {
  getUsageState,
  recordPromptShown,
  recordUsageSession,
  subscribeUsageState,
  useIsOnline,
  wasPromptShownToday
} from '@web/shared/lib';

import {
  getFeedbackPromptState,
  recordFeedbackPromptShown,
  shouldShowFeedbackPrompt,
  subscribeFeedbackPromptState
} from '../lib';

// The install hint, when due, goes first: it fires on load, this one waits.
const SETTLE_MS = 1500;

export const useFeedbackPromptTrigger = () => {
  const { openModal, getOpenedModals } = useModal();
  const isOnline = useIsOnline();
  const state = useSyncExternalStore(
    subscribeFeedbackPromptState,
    getFeedbackPromptState
  );
  const usage = useSyncExternalStore(subscribeUsageState, getUsageState);

  useEffect(() => {
    recordUsageSession();
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    if (!shouldShowFeedbackPrompt(state, usage.sessionsCount)) return;
    if (wasPromptShownToday(usage)) return;

    const timer = window.setTimeout(() => {
      if (wasPromptShownToday(getUsageState()) || getOpenedModals().length) {
        return;
      }

      recordFeedbackPromptShown();
      recordPromptShown();
      openModal('SEND_FEEDBACK');
    }, SETTLE_MS);

    return () => window.clearTimeout(timer);
  }, [isOnline, state, usage, openModal, getOpenedModals]);
};
