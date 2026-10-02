import { createClient } from '@supabase/supabase-js';

// Default provided keys from environment or configured project
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wxzgnacigsalwjfxdash.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4emduYWNpZ3NhbHdqZnhkYXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDIxODEsImV4cCI6MjEwNjQxODE4MX0.a8b66PlwWr7to8efKlDJ9QKK5zHSLLCdlphCX_WGa7M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
