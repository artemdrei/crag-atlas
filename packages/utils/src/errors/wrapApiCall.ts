import { reporter } from '../reporter/reporter';
import { isFailure } from './failure';
import { toFailure } from './toFailure';

// Normalizes any thrown value into a Failure and reports non-network ones
// before rethrowing. Call this at the boundary where a request is made
// (e.g. inside apiGet), not per-hook — one place, not one per call site.
export const wrapApiCall = async <T>(
  scope: string,
  fn: () => Promise<T>
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    const failure = isFailure(e) ? e : toFailure(e);

    if (failure.kind !== 'network') {
      reporter.error(failure, { scope, cause: e });
    }

    throw failure;
  }
};
