import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { assertLocalStack, authStorageKey, env } from './env';
import { STORAGE_STATE, STORAGE_STATE_MEMBER } from './storageState';

const LOCALE_KEY = 'crag-atlas:locale';

const serviceClient = () =>
  createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

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

/**
 * The app signs in through Google or an emailed code, neither of which a test
 * can drive. The session is written straight into the storage the web client
 * reads instead, together with the locale, so the specs assert the English
 * source strings.
 */
const saveSession = async (
  file: string,
  email: string,
  password: string
): Promise<void> => {
  const anon = createClient(env.supabaseUrl, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await anon.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session)
    throw new Error(`Could not sign ${email} in: ${error?.message}`);

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify({
      cookies: [],
      origins: [
        {
          origin: env.webUrl,
          localStorage: [
            { name: authStorageKey(), value: JSON.stringify(data.session) },
            { name: LOCALE_KEY, value: 'en' }
          ]
        }
      ]
    })
  );
};

const globalSetup = async () => {
  assertLocalStack();

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
