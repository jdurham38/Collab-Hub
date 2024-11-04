"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/utils/interfaces';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { checkOnboardStatus } from '@/services/signup';
import styles from './Auth.module.css';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const getUser = async () => {
      // Check if the URL has the 'type=recovery' parameter or if we are on the update-password page
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      if (type === 'recovery' || window.location.pathname === '/update-password') {
        // If in recovery mode or on the update-password page, skip session check and redirection
        setLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } else if (session) {
        const userData = session.user;
        setUser({
          id: userData.id,
          email: userData.email || '',
          username: userData.user_metadata?.username || '',
        });

        // Normal flow: check if the user is onboarded
        const isOnboarded = await checkOnboardStatus(userData.id);
        if (!isOnboarded) {
          router.push('/onboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = session.user;
        const currentUser: User = {
          id: userData.id,
          email: userData.email || '',
          username: userData.user_metadata?.username || '',
        };
        setUser(currentUser);

        const isOnboarded = await checkOnboardStatus(userData.id);
        if (!isOnboarded) {
          router.push('/onboard');
        } else {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
