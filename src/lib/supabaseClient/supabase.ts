// supabaseClient.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import customStorage from '@/utils/customStorage';

// In-memory storage for temporary use (used when cookies are not accepted)
const inMemoryStorage = {
  data: {} as Record<string, string>,
  getItem: (key: string): string | null => {
    return key in inMemoryStorage.data ? inMemoryStorage.data[key] : null;
  },
  setItem: (key: string, value: string): void => {
    inMemoryStorage.data[key] = value;
  },
  removeItem: (key: string): void => {
    delete inMemoryStorage.data[key];
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance of SupabaseClient
let supabase: SupabaseClient | null = null;

/**
 * Initializes and returns the singleton Supabase client instance.
 * Uses custom storage based on user consent for cookies.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const useInMemoryStorage =
      typeof window !== 'undefined' && localStorage.getItem('cookieConsent') !== 'accepted';

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: useInMemoryStorage ? inMemoryStorage : customStorage,
        persistSession: !useInMemoryStorage,
        autoRefreshToken: !useInMemoryStorage,
        detectSessionInUrl: true,
      },
    });
  }
  return supabase;
};

export default getSupabaseClient;
