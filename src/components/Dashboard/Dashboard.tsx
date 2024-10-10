'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to login if the user is not authenticated
  React.useEffect(() => {
    if (!user) {
      router.push('/'); // Replace with your login page path
    }
  }, [user, router]);

  if (!user) {
    return null; // Prevent rendering if the user is not authenticated
  }

  return (<div>Dashboard Content</div>);
}

export default Dashboard;
