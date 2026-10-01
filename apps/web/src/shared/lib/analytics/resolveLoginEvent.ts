import type { AnalyticsEvent, LoginMethod } from '@crag-atlas/analytics';

// An email code creates the account when sent and signs in a mail-app round
// trip later, so only the gap between the two tells a first sign-in apart.
const FIRST_SIGN_IN_GAP_MS = 60 * 60 * 1000;

export interface Params {
  method?: LoginMethod;
  createdAt?: string;
  lastSignInAt?: string | null;
}

export const resolveLoginEvent = ({
  method,
  createdAt,
  lastSignInAt
}: Params): AnalyticsEvent | undefined => {
  if (!method) return undefined;

  const createdMs = createdAt ? new Date(createdAt).getTime() : undefined;
  const signedInMs = lastSignInAt
    ? new Date(lastSignInAt).getTime()
    : Date.now();

  const isNew =
    createdMs !== undefined && signedInMs - createdMs < FIRST_SIGN_IN_GAP_MS;

  return { name: isNew ? 'Signed Up' : 'Logged In', props: { method } };
};
