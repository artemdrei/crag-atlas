import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value)
    throw new Error(`Missing ${name} — see apps/api/.env.integration.example`);

  return value;
};

const url = () => env('SUPABASE_URL', 'http://127.0.0.1:54321');

const LOCAL_HOSTS = ['127.0.0.1', 'localhost', '::1', 'host.docker.internal'];

// These tests delete rows; a hosted project is never the right target.
export const assertLocalStack = () => {
  const { hostname } = new URL(url());

  if (!LOCAL_HOSTS.includes(hostname))
    throw new Error(`Refusing to run integration tests against ${hostname}`);
};

// Bypasses RLS: for fixtures, never for asserting.
export const serviceClient = (): SupabaseClient =>
  createClient(url(), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false }
  });

// `climber_content` runs with the caller's rights, so a service-role key would
// read past every policy and the scoping assertions would pass regardless.
export const authenticatedClient = async (): Promise<{
  client: SupabaseClient;
  idUser: string;
}> => {
  const email = `int-${crypto.randomUUID()}@crag-atlas.test`;
  const password = crypto.randomUUID();

  const { data: created, error: createError } =
    await serviceClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (createError || !created.user)
    throw new Error(`Could not create a test user: ${createError?.message}`);

  const client = createClient(url(), env('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error)
    throw new Error(`Could not sign the test user in: ${error.message}`);

  return { client, idUser: created.user.id };
};
