// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Ensure that these environment variables are prefixed with NEXT_PUBLIC_ if you need them on the client side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
