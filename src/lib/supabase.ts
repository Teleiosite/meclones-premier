import { createClient } from '@supabase/supabase-js';

// Get environment variables and strip any accidental quotes added in Vercel UI
let rawUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/^["']|["']$/g, '').trim();
let rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '').trim();

// AUTO-FIX: If the user only provided the Project ID (e.g. 'cbnuquviujgbxyanhssv')
// we convert it into a full valid URL.
let supabaseUrl = rawUrl;
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

// Diagnostic check
let isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
const hasKey = typeof rawKey === 'string' && rawKey.length > 0;

export let isMissingEnv = !isValidUrl || !hasKey;

let client: any;

const createProxy = (errMsg: string) => new Proxy({}, {
  get: () => () => ({ data: null, error: { message: errMsg } })
});

if (!isMissingEnv) {
  try {
    // Attempt to initialize. This will throw if the URL is completely malformed (e.g. invalid chars).
    client = createClient(supabaseUrl!, rawKey!);
  } catch (err) {
    console.error("[Meclones] Supabase initialization threw an error:", err);
    client = createProxy('Supabase initialization failed due to malformed URL or Key.');
    isMissingEnv = true; // Trigger the red diagnostic indicator on screen
  }
} else {
  // SAFE FALLBACK: Never throw — a throw here causes a white screen in production.
  // Instead, use a proxy that returns graceful errors so the UI can still render.
  // The red `SUPABASE_CONFIG_MISSING` banner in main.tsx will alert the developer.
  client = createProxy('Supabase not initialized — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');

  console.error(
    '[Meclones] Supabase Configuration Error:\n' +
    `URL: ${supabaseUrl}\n` +
    `Key present: ${hasKey}`
  );
}

export const supabase = client;

