import { createClient } from '@supabase/supabase-js';

// Get environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// AUTO-FIX: If the user only provided the Project ID (e.g. 'cbnuquviujgbxyanhssv')
// we convert it into a full valid URL.
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

// Diagnostic check
const isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
const hasKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0;

export const isMissingEnv = !isValidUrl || !hasKey;

let client: any;

if (!isMissingEnv) {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  const message =
    '[Meclones] Supabase Configuration Error:\n' +
    `URL Fixed: ${supabaseUrl}\n` +
    `Key Valid: ${hasKey}`;

  if (import.meta.env.PROD) {
    throw new Error(message);
  }

  // Development/test fallback keeps local tooling from crashing, while production
  // fails fast so a misconfigured Vercel deployment cannot masquerade as online.
  client = new Proxy({}, {
    get: () => () => ({ data: null, error: { message: 'Supabase not initialized' } })
  });

  console.error(message);
}

export const supabase = client;
