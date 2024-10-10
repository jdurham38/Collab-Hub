'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthCard from "@/components/UserAuth/AuthCard/authCard";
import DashboardPage from './dashboard/page';
import { checkOnboardStatus } from '@/services/signup';
import styles from './Entry.module.css'; // Adjust the path to your CSS module

export default function Entry() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
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
      } catch (error) {
        console.error('Error checking onboard status:', error);
      } finally {
        setLoading(false); // Stop loading after checking
      }
    };

    handleOnboarding();
  }, [user]);

  useEffect(() => {
    if (isOnboarded === false && user) {
      // User is logged in but not onboarded; redirect to onboard page
      router.push('/onboard');
    }
  }, [isOnboarded, user, router]);

  if (loading) {
    // Display the spinner while checking onboarding status
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    // User is not logged in; render the AuthCard component
    return (
      <div>
        <AuthCard />
      </div>
    );
  }

  if (isOnboarded === false) {
    // While redirecting, display the spinner to prevent dashboard flash
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (isOnboarded === true) {
    // User is logged in and onboarded; render the dashboard
    return (
      <div>
        <h1>Welcome, {user.username}!</h1>
        <DashboardPage />
      </div>
    );
  }

  // Default fallback
  return null;
}
