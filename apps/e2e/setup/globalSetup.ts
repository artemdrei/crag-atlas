import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { assertLocalStack, env } from './env';
import { serviceClient, sessionState, signIn } from './session';
import { STORAGE_STATE, STORAGE_STATE_MEMBER } from './storageState';

const findOrCreate = async (
  email: string,
  password: string
): Promise<string> => {
  const admin = serviceClient().auth.admin;
  const { data, error } = await admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (!error) return data.user.id;

  const { data: existing } = await admin.listUsers({ perPage: 1000 });
  const user = existing?.users.find((row) => row.email === email);

  if (!user) throw error;

  return user.id;
};

const saveSession = async (
  file: string,
  email: string,
  password: string
): Promise<void> => {
  const session = await signIn(email, password);

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(sessionState(session)));
};

/**
 * What a run that died halfway left in the catalog. Cleanup only knows the rows
 * the current run made, so a crashed `afterAll` poisons every run after it:
 * leftover fixtures answer to the same locators the specs look for.
 *
 * Ticks, comments and media hold their route back (`on delete restrict`), so
 * they go first; regions take the sectors and routes with them.
 */
const sweepFixtures = async (): Promise<void> => {
  const client = serviceClient();

  const ids = async (
    table: string,
    column: string,
    parents: string[]
  ): Promise<string[]> => {
    if (parents.length === 0) return [];

    const { data } = await client
      .from(table)
      .select('id')
      .in(column, parents)
      .returns<{ id: string }[]>();

    return (data ?? []).map((row) => row.id);
  };

  const { data: regions } = await client
    .from('regions')
    .select('id')
    .like('name', 'TEST-%')
    .returns<{ id: string }[]>();

  const idRegions = (regions ?? []).map((row) => row.id);

  if (idRegions.length === 0) return;

  const idSectors = await ids('sectors', 'id_region', idRegions);
  const idRoutes = await ids('routes', 'id_sector', idSectors);

  for (const table of ['ticks', 'route_comments', 'route_media'])
    if (idRoutes.length > 0)
      await client.from(table).delete().in('id_route', idRoutes);

  await client.from('regions').delete().in('id', idRegions);
};

const REPO_ROOT = new URL('../../../', import.meta.url).pathname;

// `supabase start` applies migrations only to an empty database, so a local
// stack that outlives a pull keeps the old schema and every spec fails on it.
const applyMigrations = (): void => {
  try {
    execFileSync('supabase', ['migration', 'up', '--local'], {
      cwd: REPO_ROOT,
      stdio: 'pipe'
    });
  } catch (error) {
    const output = (error as { stderr?: Buffer }).stderr?.toString() ?? '';

    throw new Error(
      `Could not migrate the local database. If a migration's objects already exist, mark it with \`supabase migration repair --local --status applied <version>\`.\n${output}`
    );
  }
};

const globalSetup = async () => {
  assertLocalStack();

  applyMigrations();

  await sweepFixtures();

  const idAdmin = await findOrCreate(env.adminEmail, env.adminPassword);

  await findOrCreate(env.memberEmail, env.memberPassword);

  // 015's sign-up trigger fills public.users for both; only the role is ours
  // to add, and edit mode is gated on it. The member deliberately gets none.
  const { error } = await serviceClient()
    .from('user_roles')
    .upsert({ id_user: idAdmin, role: 'admin' });

  if (error) throw new Error(`Could not grant admin: ${error.message}`);

  await saveSession(STORAGE_STATE, env.adminEmail, env.adminPassword);
  await saveSession(STORAGE_STATE_MEMBER, env.memberEmail, env.memberPassword);
};

export default globalSetup;
