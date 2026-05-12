import { createClient } from '@supabase/supabase-js';

// Vite handles VITE_ prefixed variables automatically.
// On Vercel, ensure these are added to Project Settings > Environment Variables.
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isMissingEnv = !supabaseUrl || !supabaseAnonKey;

// Create a safe client. If keys are missing, we use placeholder strings 
// to prevent the createClient function itself from throwing an error.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

if (isMissingEnv) {
  console.warn(
    '[Meclones] Supabase keys are missing from environment variables. ' +
    'The app will load but authentication and data fetching will fail.'
  );
}
