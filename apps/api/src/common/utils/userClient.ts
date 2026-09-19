import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../../config/supabase.config';
import type { AuthUser } from '../guards/supabaseAuth.guard';

/**
 * Calls the database as the user, so their RLS policies still apply — a
 * forged id or a missing admin row is rejected by Postgres, not only by us.
 */
export const userClient = ({ accessToken }: AuthUser): SupabaseClient => {
  const { url, anonKey } = supabaseConfig();

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
};
