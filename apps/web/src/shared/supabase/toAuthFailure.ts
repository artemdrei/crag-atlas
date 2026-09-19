import { domainFailure, type Failure, toFailure } from '@crag-atlas/utils';
import { AuthError } from '@supabase/supabase-js';

/**
 * Supabase's `AuthError` has no `details`, so the shared `toFailure` would
 * flatten it to `unknown` and the toast would lose the real reason (invalid
 * code, expired code, rate limit). Normalizing at the auth boundary mirrors
 * what `httpClient` does for the API boundary.
 */
export const toAuthFailure = (err: unknown): Failure =>
  err instanceof AuthError
    ? domainFailure(err.code ?? 'auth.error', err.message)
    : toFailure(err);
