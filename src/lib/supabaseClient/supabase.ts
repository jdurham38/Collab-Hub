import { createClient, SupabaseClient } from '@supabase/supabase-js';
import customStorage from '@/utils/customStorage';

// In-memory storage for temporary use
const inMemoryStorage = {
  data: {} as Record<string, string>,
  getItem: (key: string): string | null => inMemoryStorage.data[key] || null,
  setItem: (key: string, value: string): void => {
    inMemoryStorage.data[key] = value;
  },
  removeItem: (key: string): void => {
    delete inMemoryStorage.data[key];
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: SupabaseClient | null = null;

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
