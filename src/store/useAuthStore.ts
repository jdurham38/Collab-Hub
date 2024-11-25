import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js'; // Import the Session type from Supabase

interface AuthState {
  isLoggedIn: boolean;
  isCookieConsentGiven: boolean | null; // Allow null for cookie consent
  session: Session | null; // Use the Supabase Session type
  setLoggedIn: (loggedIn: boolean) => void;
  setCookieConsent: (consent: boolean | null) => void; // Allow null for cookie consent
  setSession: (session: Session | null) => void; // Use the Supabase Session type
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isLoggedIn: false,
      isCookieConsentGiven: null, // Initialize cookie consent as null
      session: null, // Initialize session as null
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setCookieConsent: (consent) => set({ isCookieConsentGiven: consent }),
      setSession: (session) => set({ session }), // Setter for session
    }),
    {
      name: 'auth-storage', // Key to store in local storage
    }
  )
);
