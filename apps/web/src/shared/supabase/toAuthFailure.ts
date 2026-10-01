import { domainFailure, type Failure, toFailure } from '@crag-atlas/utils';
import { AuthError } from '@supabase/supabase-js';

// Supabase's `AuthError` has no `details`, so the shared `toFailure` would
// flatten it to `unknown` and lose the real reason.
export const toAuthFailure = (err: unknown): Failure =>
  err instanceof AuthError
    ? domainFailure(err.code ?? 'auth.error', err.message)
    : toFailure(err);
