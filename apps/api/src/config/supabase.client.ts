import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseConfig } from './supabase.config';

let client: SupabaseClient | null = null;

// Built on first use, not at import time, so booting without env (e.g.
// `gen:contracts`) still works. No elevated key, so RLS still applies.
export const publicSupabase = (): SupabaseClient => {
  if (!client) {
    const { url, anonKey } = supabaseConfig();

    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return client;
};

let serviceClient: SupabaseClient | null = null;

// Bypasses row level security, so it is handed only to work that runs on its
// own behalf rather than a caller's — building a sector's skyline long after
// the request that queued it has been answered. Never pass it anything that
// came off the wire.
export const serviceSupabase = (): SupabaseClient | null => {
  const { url, serviceRoleKey } = supabaseConfig();

  if (!serviceRoleKey) return null;

  if (!serviceClient) {
    serviceClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return serviceClient;
};

// Public bucket URLs are stable and derivable, so no round trip is needed.
export const storagePublicUrl = (bucket: string, path: string): string =>
  `${supabaseConfig().url}/storage/v1/object/public/${bucket}/${path}`;
