import { createClient, type Session } from '@supabase/supabase-js';

import { authStorageKey, env } from './env';

const LOCALE_KEY = 'crag-atlas:locale';
// A returning climber's first tick opens the install hint over every page;
// no spec is about it.
const INSTALL_HINT_KEY = 'crag-atlas:install-hint';
const INSTALL_HINT_VALUE = JSON.stringify({ isInstalled: true });

const CLIENT_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false }
};

export const serviceClient = () =>
  createClient(env.supabaseUrl, env.serviceRoleKey, CLIENT_OPTIONS);

export const signIn = async (
  email: string,
  password: string
): Promise<Session> => {
  const { data, error } = await createClient(
    env.supabaseUrl,
    env.anonKey,
    CLIENT_OPTIONS
  ).auth.signInWithPassword({ email, password });

  if (error || !data.session)
    throw new Error(`Could not sign ${email} in: ${error?.message}`);

  return data.session;
};

/**
 * The app signs in through Google or an emailed code, neither of which a test
 * can drive. The session is written straight into the storage the web client
 * reads instead, together with the locale, so the specs assert the English
 * source strings.
 */
export const sessionState = (session: Session) => ({
  cookies: [] as [],
  origins: [
    {
      origin: env.webUrl,
      localStorage: [
        { name: authStorageKey(), value: JSON.stringify(session) },
        { name: LOCALE_KEY, value: 'en' },
        { name: INSTALL_HINT_KEY, value: INSTALL_HINT_VALUE }
      ]
    }
  ]
});
