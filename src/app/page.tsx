'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthCard from "@/components/UserAuth/AuthCard/authCard";
import DashboardPage from './dashboard/page';

export default function Entry() {
  const { user } = useAuth();

  if (!user) {
    // User is not logged in, render the AuthCard component
    return (
      <div>
        <AuthCard />
      </div>
    );
  }

  // User is logged in, render the home page content
  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <DashboardPage />
    </div>
  );
}
