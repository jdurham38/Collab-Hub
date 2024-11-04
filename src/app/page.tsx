'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthCard from '@/components/UserAuth/AuthCard/authCard';
import DashboardPage from './dashboard/page';
import { checkOnboardStatus } from '@/services/signup';
import styles from './Entry.module.css';

export default function Entry() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {

    // Check if the URL contains a password recovery hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
      setLoading(false); // Stop loading as we don't need to check onboarding in this case
      return;
    }

    const handleOnboarding = async () => {
      if (!user) {
        // User is not logged in; stop loading to render AuthCard
        setLoading(false);
        return;
      }

      try {
        // Check if the user is onboarded
        const onboarded = await checkOnboardStatus(user.id);
        setIsOnboarded(onboarded);

        // If the user is not onboarded, redirect to the onboard page
        if (!onboarded) {
          router.push('/onboard');
        }
      } catch (error) {
        console.error('Error checking onboard status:', error);
      } finally {
        setLoading(false); // Stop loading after the check
      }
    };

    handleOnboarding();
  }, [user, router]);

  useEffect(() => {
    // Prevent redirection if in password recovery mode
    if (isPasswordRecovery) {
      return;
    }

    if (user && isOnboarded === false) {
      router.push('/onboard');
    }
  }, [user, isOnboarded, router, isPasswordRecovery]);

  if (loading) {
    // Display a loading spinner while checking the onboarding status
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    // If the user is not logged in, render the AuthCard component
    return (
      <div>
        <AuthCard />
      </div>
    );
  }

  if (isOnboarded === false) {
    // While redirecting, display a spinner to prevent a flash of the dashboard
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (isOnboarded === true) {
    // If the user is logged in and onboarded, render the DashboardPage
    return (
      <div>
        <h1>Welcome, {user.username}!</h1>
        <DashboardPage />
      </div>
    );
  }

  // Fallback in case of unexpected state
  return null;
}
