'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedComponent from '@/components/ProtectedComponent/protected-page';

const SecuritySettings: React.FC = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { setLoggedIn } = useAuthStore();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setLoggedIn(false);
      router.push('/');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError || !data?.session) {
        console.error('Error authenticating user:', signInError?.message);
        alert('Authentication failed. Please check your credentials.');
        return;
      }

      const accessToken = data.session.access_token;

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: data.user.id }),
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('Error deleting account:', result.error);
        alert('Error deleting account: ' + result.error);
        return;
      }

      alert('Account deleted successfully.');

      setLoggedIn(false);
      router.push('/');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during account deletion:', error);
      alert('Error during account deletion');
    }
  };

  return (
    <div>
      <ProtectedComponent />
      <h2>Account Settings</h2>
      <div>
        <h3>Delete Account</h3>
        <p>Please enter your credentials to confirm account deletion.</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Sign Out</h3>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
};

export default SecuritySettings;
