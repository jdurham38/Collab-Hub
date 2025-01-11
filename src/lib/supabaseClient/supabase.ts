import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupportedStorage } from '@supabase/auth-js';

// In memory storage for when cookie consent is not granted
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
    clear: () => {
      inMemoryStorage.data = {};
    },
  };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: SupabaseClient | null = null;

export const customStorage: SupportedStorage = {
    getItem: (key: string): string | null => {
      try {
       if (typeof window !== 'undefined') {
          const consent = localStorage.getItem('cookieConsent');
             if (consent === 'accepted') {
                return localStorage.getItem(key);
             }
         }
       } catch (error) {
           console.error('Error accessing localStorage:', error);
         }
         return null;
     },
     setItem: (key: string, value: string): void => {
         try {
         if (typeof window !== 'undefined') {
           const consent = localStorage.getItem('cookieConsent');
              if (consent === 'accepted') {
                localStorage.setItem(key, value);
              }
         }
       } catch (error) {
           console.error('Error accessing localStorage:', error);
       }
     },
   removeItem: (key: string): void => {
         try {
          if (typeof window !== 'undefined') {
              localStorage.removeItem(key);
           }
         } catch (error) {
           console.error('Error accessing localStorage:', error);
         }
     },
};

/**
 * Initializes and returns the singleton Supabase client instance.
 * Uses custom storage based on user consent for cookies.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {

      const useInMemoryStorage =
         typeof window !== 'undefined' &&
         localStorage.getItem('cookieConsent') !== 'accepted';

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