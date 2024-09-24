// components/SignupForm.tsx
"use client"
import React, { useState } from 'react';
import { UserData } from '@/utils/interfaces';

// Define the expected shape of the API response
interface SignupResponse {
  message: string;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}

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
      // Send signup request to the API route
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Use the defined SignupResponse type to handle the response
      const result: SignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign up');
      }

      setSuccessMessage(`Signup successful: ${result.user?.email}`);
    } catch (error: unknown) {
      // Ensure the error message handling is type-safe
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  };

  return (
    <form onSubmit={handleSignup}>
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
