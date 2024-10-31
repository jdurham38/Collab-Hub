// AuthContext.tsx

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/utils/interfaces';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import { checkOnboardStatus } from '@/services/signup';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Loading state to manage the session check
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const getUser = async () => {
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
      } else {
        // Handle case where session is null (user signed out or deleted)
        setUser(null);
      }

      setLoading(false); // Set loading to false after session check
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

        // Check if the user is onboarded if session and user data are valid
        const isOnboarded = await checkOnboardStatus(userData.id);
        if (!isOnboarded) {
          router.push('/onboard');
        } else {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // Handle sign-out by clearing user state
        setUser(null);
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Show a loading state while checking the session
  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
