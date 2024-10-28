'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import { User } from '@/utils/interfaces'; // Ensure User interface is correctly defined
import supabase from '@/lib/supabaseClient/supabase'; // Import supabase client
import { checkOnboardStatus } from '@/services/signup'; // Import the checkOnboardStatus function

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    // Function to get the current user session
    const getUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else if (session) {
        const userData = session.user;
        const username = userData.user_metadata?.username || '';
        const currentUser: User = {
          id: userData.id,
          email: userData.email || '',
          username: username,
        };
        setUser(currentUser);
      }
    };

    getUser();

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userData = session.user;
          const username = userData.user_metadata?.username || '';
          const currentUser: User = {
            id: userData.id,
            email: userData.email || '',
            username: username,
          };
          setUser(currentUser);

          // Check if the user is onboarded
          const isOnboarded = await checkOnboardStatus(currentUser.id);
          if (!isOnboarded) {
            router.push('/onboard');
          } else {
            // Redirect to the dashboard or home page
            router.push('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/'); // Redirect to home page on sign out
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

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
