// components/LoginForm.tsx
"use client"

import React, { useState } from 'react';
import { UserData } from '@/utils/interfaces';
import supabase from '@/lib/supabaseClient/supabase';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData: UserData = {
      email,
      password,
    };

    const { data, error } = await supabase.auth.signInWithPassword(userData);

    if (error) {
      setErrorMessage(`Error logging in: ${error.message}`);
      return;
    }

    setSuccessMessage(`Login successful: ${data?.user?.email}`);
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Log In</button>
      {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}
    </form>
  );
};

export default LoginForm;
