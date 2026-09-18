import type { Failure } from './failure';

export const resolveFailureMessage = (failure: Failure): string => {
  if (failure.kind === 'network') return 'Check your connection';

  if (failure.kind === 'unknown') return 'Something went wrong';

  return failure.message;
};
