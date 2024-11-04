'use client';

import { useAuthStore } from '@/lib/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './protectedpage.module.css'; // Import the CSS for the spinner

const ProtectedComponent = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(false); // Stop loading when the user is logged in
    } else {
      router.push('/'); // Redirect to login if not logged in
    }
  }, [isLoggedIn, router]);

  // Display the spinner while loading
  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Once loading is complete and the user is logged in, display the protected content
  return <div>Protected Content</div>;
};

export default ProtectedComponent;
