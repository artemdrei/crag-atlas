export const supabaseConfig = () => ({
  url: process.env.SUPABASE_URL ?? '',
  anonKey: process.env.SUPABASE_ANON_KEY ?? '',
  // Never reaches a request handler: the only writer that holds it is the
  // skyline builder, which runs on a timer with nothing from a client but a
  // sector id that was already public to read.
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
});
