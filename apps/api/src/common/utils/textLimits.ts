import { ValidationException } from '../exceptions/app.exception';

// A copy of `TEXT_LIMITS` in `packages/utils`: the API runs from `dist` and
// cannot load that package's source. `textLimits.spec.ts` keeps the two equal;
// the check constraints in `020_feedback.sql` are kept in step by hand.
export const TEXT_LIMITS = {
  feedbackMessage: 800,
  email: 254,
  tickNote: 500,
  routeComment: 500,
  catalogDescription: 2000
} as const;

export const assertWithinLimit = (
  value: string | null | undefined,
  limit: number,
  label: string
): void => {
  if (value && value.length > limit) {
    throw new ValidationException(
      `${label} is longer than ${limit} characters`,
      'TEXT_TOO_LONG'
    );
  }
};

export const limitedDescription = (
  description: string | null | undefined
): string => {
  const trimmed = description?.trim() ?? '';
  assertWithinLimit(trimmed, TEXT_LIMITS.catalogDescription, 'A description');

  return trimmed;
};
