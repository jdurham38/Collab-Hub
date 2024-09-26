"use client"
import React, { useState } from 'react';
import { UserData, SignupResponse } from '@/utils/interfaces';
import { signup } from '@/services/signup';

import styles from './SignupForm.module.css'

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData: UserData = {
      email,
      password,
    };

    try {
      const result: SignupResponse = await signup(userData);
      setSuccessMessage(`Signup successful: ${result.user?.email}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  };

  return (
<form onSubmit={handleSignup} className={styles.form}>
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
      <button type="submit">Sign Up</button>
      {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}
    </form>
  );
};

export default SignupForm;
