import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

// For direct PostgreSQL connection
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || '72.61.238.231',
  port: parseInt(import.meta.env.VITE_DB_PORT || '3000'),
  user: import.meta.env.VITE_DB_USER || 'Sanam',
  password: import.meta.env.VITE_DB_PASSWORD || 'Sanam@28',
  database: import.meta.env.VITE_DB_NAME || 'postgres',
};

// Supabase client (keeping for compatibility)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export { DATABASE_URL };
