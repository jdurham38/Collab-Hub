'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // User is authenticated, redirect to onboard
      router.push('/onboard');
    }
  }, [user, router]);

  return (
    <div>
      <h1>Please Verify Your Email</h1>
      <p>
        We have sent a confirmation email to your email address. Please check your inbox and click
        on the confirmation link to verify your email.
      </p>
    </div>
  );
};

export default VerifyEmail;
