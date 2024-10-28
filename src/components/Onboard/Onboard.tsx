'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient/supabase'; // Import your Supabase client

const Onboard: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      console.log('Signed out successfully');
      router.push('/');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    // Get the current session to obtain the access token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Error getting session:', sessionError?.message);
      return;
    }

    const accessToken = session.access_token;

    // Send a request to the API route to delete the account
    const response = await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error deleting account:', result.error);
      alert('Error deleting account: ' + result.error);
      return;
    }

    console.log('Account deleted successfully.');

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to home page or show a message
    router.push('/');
  };

  return (
    <div>
      <p>To be completed</p>
      <button onClick={handleSignOut}>Sign Out</button>
      <button onClick={handleDeleteAccount}>Delete Account</button>
    </div>
  );
};

export default Onboard;
