import { existsSync } from 'node:fs';

const ENV_FILE = new URL('../.env', import.meta.url).pathname;

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) throw new Error(`Missing ${name} — see apps/e2e/.env.example`);

  return value;
};

const webUrl = required('WEB_URL', 'http://localhost:4100');

export const env = {
  supabaseUrl: required('SUPABASE_URL', 'http://127.0.0.1:55321'),
  anonKey: required('SUPABASE_ANON_KEY'),
  serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  // Deliberately not 4000/4001: the developer's own dev servers live there,
  // pointed at a hosted project, and this suite erases rows.
  webUrl,
  apiUrl: required('API_URL', 'http://localhost:4101'),
  amplitudeUrl: `${webUrl}/__amplitude`,
  adminEmail: process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@crag-atlas.test',
  adminPassword: process.env.E2E_ADMIN_PASSWORD ?? 'e2e-admin-password',
  memberEmail: process.env.E2E_MEMBER_EMAIL ?? 'e2e-member@crag-atlas.test',
  memberPassword: process.env.E2E_MEMBER_PASSWORD ?? 'e2e-member-password'
};

// The suite erases catalog rows for good and creates users with a service-role
// key. Pointed at a hosted project it would do that to real data, so the host
// is checked once, here, rather than trusted per call.
const LOCAL_HOSTS = ['127.0.0.1', 'localhost', '::1', 'host.docker.internal'];

export const assertLocalStack = () => {
  const { hostname } = new URL(env.supabaseUrl);

  if (!LOCAL_HOSTS.includes(hostname))
    throw new Error(
      `Refusing to run against ${hostname} — the e2e suite only runs on the local Supabase stack`
    );
};

/**
 * How supabase-js derives its default localStorage key. Mirrored rather than
 * hardcoded so an unusual SUPABASE_URL still lands on the key the web app
 * reads. @see @supabase/supabase-js SupabaseClient
 */
export const authStorageKey = () =>
  `sb-${new URL(env.supabaseUrl).hostname.split('.')[0]}-auth-token`;
