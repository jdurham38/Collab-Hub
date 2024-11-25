"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/utils/interfaces';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { useAuthStore } from '@/store/useAuthStore';
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
  const router = useRouter();

  // Memoize Supabase client to prevent re-instantiation
  const supabase = useMemo(() => getSupabaseClient(), []);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');

        if (session && isLoggedIn) {
          console.log('Using persisted session:', session);
          const userData = session.user;
          setUser((prevUser) => {
            // Update only if user data has changed
            if (prevUser?.id !== userData.id) {
              return {
                id: userData.id,
                email: userData.email || '',
                username: userData.user_metadata?.username || '',
              };
            }
            return prevUser;
          });
        } else {
          const {
            data: { session: freshSession },
            error,
          } = await supabase.auth.getSession();

          if (error || !freshSession) {
            console.log('No session found during initial check.');
            setLoggedIn(false);
            setUser(null);
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
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setUser(null);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Run only once on component mount

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event);
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          const userData = session.user;
          setUser({
            id: userData.id,
            email: userData.email || '',
            username: userData.user_metadata?.username || '',
          });
          setLoggedIn(true);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoggedIn(false);
          router.push('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, setLoggedIn, setSession, supabase.auth]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ user, setUser }),
    [user] // Recompute only when `user` changes
  );

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
