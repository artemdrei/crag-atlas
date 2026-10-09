import { describe, expect, it } from 'vitest';

import {
  type FeedbackPromptState,
  shouldShowFeedbackPrompt
} from './feedbackPromptState';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 30 * DAY;

const fresh: FeedbackPromptState = { shownCount: 0 };

describe('shouldShowFeedbackPrompt', () => {
  it('asks on the third day of use', () => {
    expect(shouldShowFeedbackPrompt(fresh, 2, NOW)).toBe(false);
    expect(shouldShowFeedbackPrompt(fresh, 3, NOW)).toBe(true);
  });

  it('asks again two weeks later, three times in all', () => {
    const shown = { shownCount: 1, shownAt: NOW - 13 * DAY };

    expect(shouldShowFeedbackPrompt(shown, 9, NOW)).toBe(false);
    expect(
      shouldShowFeedbackPrompt({ ...shown, shownAt: NOW - 14 * DAY }, 9, NOW)
    ).toBe(true);
    expect(
      shouldShowFeedbackPrompt(
        { shownCount: 3, shownAt: NOW - 30 * DAY },
        9,
        NOW
      )
    ).toBe(false);
  });

  it('never asks again once feedback was sent', () => {
    expect(
      shouldShowFeedbackPrompt({ shownCount: 1, sentAt: NOW - DAY }, 9, NOW)
    ).toBe(false);
  });
});
