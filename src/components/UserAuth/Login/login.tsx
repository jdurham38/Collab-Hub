// components/LoginForm.tsx
"use client"

import React, { useState } from 'react';
import { UserData } from '@/utils/interfaces';
import supabase from '@/lib/supabaseClient/supabase';

import styles from './LoginForm.module.css';

import { FaEye, FaEyeSlash } from 'react-icons/fa';


const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state variable
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
    <form onSubmit={handleLogin} className={styles.form}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      {/* Password Input with Toggle Button */}
      <div className={styles.passwordInputWrapper}>
        <input
          type={showPassword ? 'text' : 'password'} // Toggle input type
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      <button
        type="button"
        className={styles.passwordToggleButton}
        onClick={() => setShowPassword(!showPassword)}
        aria-label="Toggle password visibility"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
      </div>

      <button type="submit">Login Here</button>
      {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}
    </form>
  );
};

export default LoginForm;
