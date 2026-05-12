import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnostic check: Are they valid strings starting with http?
const isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
const hasKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0;

export const isMissingEnv = !isValidUrl || !hasKey;

/**
 * We wrap the client creation. 
 * If keys are missing, we return a 'dummy' proxy object that doesn't 
 * throw errors but also doesn't do anything, allowing the UI to render.
 */
let client: any;

if (!isMissingEnv) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Return a proxy that swallows calls to prevent crashes in the UI
  client = new Proxy({}, {
    get: () => () => ({ data: null, error: { message: 'Supabase not initialized' } })
  });
  
  console.error(
    '[Meclones] Supabase Configuration Error:\n' +
    `URL Valid: ${isValidUrl} (${supabaseUrl})\n` +
    `Key Valid: ${hasKey}`
  );
}

export const supabase = client;
