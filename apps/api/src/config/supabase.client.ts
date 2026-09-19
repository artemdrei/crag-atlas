import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseConfig } from './supabase.config';

let client: SupabaseClient | null = null;

/**
 * Anonymous client for the public catalog. Built on first use, not at import
 * time, so booting without env (e.g. `gen:contracts`) still works — and it
 * carries no elevated key, so the read-only RLS policies still apply.
 */
export const publicSupabase = (): SupabaseClient => {
  if (!client) {
    const { url, anonKey } = supabaseConfig();

    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return client;
};
