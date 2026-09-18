import {
  domainFailure,
  type Failure,
  isFailure,
  networkFailure,
  unknownFailure
} from './failure';

interface PostgrestErrorShape {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

const hasProp = <K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> =>
  typeof value === 'object' && value !== null && key in value;

// Supabase/Postgrest error shape — not wired to any call site yet, but this
// is the exact shape Supabase throws once queries move off the JSON stub.
const isPostgrestError = (e: unknown): e is PostgrestErrorShape =>
  hasProp(e, 'code') &&
  hasProp(e, 'message') &&
  typeof (e as { code: unknown }).code === 'string' &&
  typeof (e as { message: unknown }).message === 'string' &&
  hasProp(e, 'details');

const isFetchNetworkError = (e: unknown): e is TypeError =>
  e instanceof TypeError;

export const toFailure = (e: unknown): Failure => {
  if (isFailure(e)) return e;

  if (isPostgrestError(e)) {
    return domainFailure(e.code, e.message, {
      details: e.details,
      hint: e.hint
    });
  }

  if (isFetchNetworkError(e)) {
    return networkFailure(e.message, e);
  }

  if (e instanceof Error) {
    return unknownFailure(e.message, e);
  }

  if (typeof e === 'string') {
    return unknownFailure(e);
  }

  return unknownFailure('Unknown error', e);
};
