'use client';

import React, { useState } from 'react';
import { UserData, SignupResponse } from '@/utils/interfaces';
import { signup } from '@/services/signup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import styles from './SignupForm.module.css';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData: UserData = {
      email,
      password,
      username,
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
        type="text"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <div className={styles.passwordInputWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
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
      <button type="submit">Sign Up</button>
      {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}
    </form>
  );
};

export default SignupForm;
