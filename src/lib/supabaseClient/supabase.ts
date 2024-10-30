// supabaseClient.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import customStorage from '@/utils/customStorage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    if (typeof window === 'undefined') {
      // Server-side initialization
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          storage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      });
    } else {
      // Client-side initialization
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: customStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
  }
  return supabase;
};

export default getSupabaseClient;
