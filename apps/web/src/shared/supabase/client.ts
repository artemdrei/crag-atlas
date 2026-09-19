import { createClient } from '@supabase/supabase-js';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — see apps/web/.env.example'
  );
}

/**
 * Bypasses the Web Locks API, which deadlocks auth calls after the tab idles.
 * @see https://github.com/supabase/supabase-js/issues/1594
 */
const noOpLock = async <T>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>
): Promise<T> => fn();

/**
 * Auth only — sessions, sign in, sign out. Application data always goes
 * through `apps/api` (`shared/api`), never through `supabase.from(...)`.
 */
export const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  { auth: { lock: noOpLock } }
);
