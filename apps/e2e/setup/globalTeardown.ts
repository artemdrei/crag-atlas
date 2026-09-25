import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import { assertLocalStack, env } from './env';

const BUCKETS = ['media', 'topos', 'regions'];

/**
 * A safety net, not the cleanup itself: the specs erase their own rows and the
 * API takes each file out with its row. What lands here is what a spec that
 * died halfway left behind — an upload whose row never made it to an erase.
 *
 * Only objects nothing points at are removed, and only on the local stack.
 */
const globalTeardown = async () => {
  assertLocalStack();

  const client = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const referenced = new Set(
    (
      await Promise.all([
        column(client, 'topos', 'storage_path'),
        column(client, 'route_media', 'storage_path'),
        column(client, 'regions', 'photo_path')
      ])
    ).flat()
  );

  for (const bucket of BUCKETS) {
    const orphans = (await listBucket(client, bucket)).filter(
      (path) => !referenced.has(path)
    );

    if (orphans.length === 0) continue;

    await client.storage.from(bucket).remove(orphans);
  }
};

const column = async (
  client: SupabaseClient,
  table: string,
  name: string
): Promise<string[]> => {
  const { data } = await client
    .from(table)
    .select(name)
    .returns<Record<string, string | null>[]>();

  return (data ?? [])
    .map((row) => row[name])
    .filter((path): path is string => !!path);
};

/** Paths are one folder deep: `<id of the row it belongs to>/<uuid>.webp`. */
const listBucket = async (
  client: SupabaseClient,
  bucket: string
): Promise<string[]> => {
  const { data: folders } = await client.storage.from(bucket).list('');
  const paths = await Promise.all(
    (folders ?? []).map(async ({ name }) => {
      const { data: files } = await client.storage.from(bucket).list(name);

      return (files ?? []).map((file) => `${name}/${file.name}`);
    })
  );

  return paths.flat();
};

export default globalTeardown;
