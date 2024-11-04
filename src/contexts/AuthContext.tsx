'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/utils/interfaces';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { useAuthStore } from '@/lib/useAuthStore';
import styles from './Auth.module.css';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, setLoggedIn, setSession, session } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false); // New flag
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');

        // Use persisted session from Zustand if available
        if (session && isLoggedIn) {
          console.log('Using persisted session:', session);
          const userData = session.user;
          setUser({
            id: userData.id,
            email: userData.email || '',
            username: userData.user_metadata?.username || '',
          });
          setLoading(false);
          return;
        }

        // Check user session with Supabase
        const { data: { session: freshSession }, error } = await supabase.auth.getSession();

        if (error || !freshSession) {
          console.log('No session found during initial check.');
          // Delay marking as logged out until initial check is complete
        } else {
          console.log('Fresh session found:', freshSession);
          setSession(freshSession);
          const userData = freshSession.user;
          setUser({
            id: userData.id,
            email: userData.email || '',
            username: userData.user_metadata?.username || '',
          });
          setLoggedIn(true);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setUser(null);
        setLoggedIn(false);
      } finally {
        setInitialCheckComplete(true); // Mark initial check as complete
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isLoggedIn, session, setLoggedIn, setSession, supabase]);

  useEffect(() => {
    // Only set logged out if initial check is complete and no session was found
    if (initialCheckComplete && !session) {
      setLoggedIn(false);
      setUser(null);
    }
  }, [initialCheckComplete, session, setLoggedIn]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event);
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session);
        setSession(session);
        const userData = session.user;
        setUser({
          id: userData.id,
          email: userData.email || '',
          username: userData.user_metadata?.username || '',
        });
        setLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setSession(null);
        setUser(null);
        setLoggedIn(false);
        router.push('/');
      } else if (event === 'INITIAL_SESSION' && session) {
        console.log('Initial session detected:', session);
        setSession(session);
        const userData = session.user;
        setUser({
          id: userData.id,
          email: userData.email || '',
          username: userData.user_metadata?.username || '',
        });
        setLoggedIn(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setLoggedIn, setSession, supabase, router]);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
