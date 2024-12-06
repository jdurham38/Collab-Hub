import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  isLoggedIn: boolean;
  isCookieConsentGiven: boolean | null;
  session: Session | null;
  setLoggedIn: (loggedIn: boolean) => void;
  setCookieConsent: (consent: boolean | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isLoggedIn: false,
      isCookieConsentGiven: null,
      session: null,
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setCookieConsent: (consent) => set({ isCookieConsentGiven: consent }),
      setSession: (session) => set({ session }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
