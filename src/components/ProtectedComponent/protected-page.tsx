'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './protectedpage.module.css'; 

const ProtectedComponent = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(false); 
    } else {
      router.push('/'); 
    }
  }, [isLoggedIn, router]);

  
  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  
  return <></>;
};

export default ProtectedComponent;
