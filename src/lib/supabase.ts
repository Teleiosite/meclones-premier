import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL    as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const MISSING_ENV = !supabaseUrl || !supabaseAnonKey;

if (MISSING_ENV) {
  console.error(
    '[Meclones] CRITICAL: Supabase credentials are missing!\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel ' +
    'environment variables and redeploy.'
  );
}

// Use placeholder values so createClient does not throw during module load.
// All Supabase calls will silently fail until real credentials are provided.
export const supabase = createClient(
  supabaseUrl     ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
);

export const isMissingEnv = MISSING_ENV;

/** Fetch the current user's role from the profiles table. */
export async function getUserRole(): Promise<string | null> {
  if (MISSING_ENV) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return data?.role ?? null;
}
