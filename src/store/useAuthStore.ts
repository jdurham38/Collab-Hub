import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
    isLoggedIn: boolean;
    isCookieConsentGiven: boolean | null;
    session: Session | null;
    supabaseUser: SupabaseUser | null; // Use Supabase's User type
    setLoggedIn: (loggedIn: boolean) => void;
    setCookieConsent: (consent: boolean | null) => void;
    setSession: (session: Session | null) => void;
    setSupabaseUser: (supabaseUser: SupabaseUser | null) => void;
}

export const useAuthStore = create(
    persist<AuthState>(
        (set) => ({
            isLoggedIn: false,
            isCookieConsentGiven: null,
            session: null,
            supabaseUser: null,
            setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
            setCookieConsent: (consent) => set({ isCookieConsentGiven: consent }),
            setSession: (session) => set({ session }),
            setSupabaseUser: (supabaseUser) => set({ supabaseUser }), // Updated
        }),
        {
            name: 'auth-storage',
        },
    ),
);