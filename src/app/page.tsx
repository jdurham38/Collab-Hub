'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import AuthCard from '@/components/UserAuth/AuthCard/authCard';
import styles from './Entry.module.css';

export default function Entry() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, router]);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div>
      <AuthCard />
    </div>
  );
}
