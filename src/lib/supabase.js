import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-missing-env.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-missing-env-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('CRITICAL: Missing Supabase environment variables! You must add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment host (Cloudflare Pages).');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
