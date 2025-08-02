import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add SUPABASE_URL and SUPABASE_API_KEY to your .env.local file'
  );
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);
