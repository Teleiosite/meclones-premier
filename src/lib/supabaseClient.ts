import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/^["']|["']$/g, '').trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '').trim();

let supabaseUrl = rawUrl;
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

if (!supabaseUrl || !rawKey) {
  throw new Error("Supabase initialization failed: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required in environment variables.");
}

export const supabaseClient = createClient(supabaseUrl, rawKey);
