'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import AuthCard from '@/components/UserAuth/AuthCard/authCard';
import styles from './Entry.module.css';

export default function Entry() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [authInitialized, setAuthInitialized] = useState(false); // New state to check if auth is initialized
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Effect to determine when auth state is initialized
  useEffect(() => {
    // Simulate an initialization delay or check if Zustand's state is set up
    const initializeAuth = () => {
      // Wait for a short time to ensure the auth state is updated
      setTimeout(() => {
        setAuthInitialized(true);
      }, 500); // Adjust the delay as needed
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (authInitialized) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    }
  }, [isLoggedIn, authInitialized, router]);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        <AuthCard />
      </div>
    );
  }

  return null;
}
