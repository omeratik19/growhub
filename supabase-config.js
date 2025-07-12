// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Supabase client configuration
const supabaseConfig = {
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_ANON_KEY,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
};

module.exports = { supabaseConfig, SUPABASE_URL, SUPABASE_ANON_KEY };
