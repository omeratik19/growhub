// Supabase Configuration
// Bu dosyayı Supabase projenizden aldığınız bilgilerle güncelleyin
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "your-anon-key-here";

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
