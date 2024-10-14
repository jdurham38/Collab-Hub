// components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { UserData, User } from '@/utils/interfaces'; // Import your custom User interface
import supabase from '@/lib/supabaseClient/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { checkOnboardStatus } from '@/services/signup';
import styles from './LoginForm.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
  
    const userData: UserData = {
      email,
      password,
    };
  
    const { data, error } = await supabase.auth.signInWithPassword(userData);
  
    if (error) {
      setErrorMessage('Login failed, either password or email is incorrect');
      setLoading(false);
      return;
    }
  
    if (data && data.user) {
      const { user } = data;
  
      // Extract the username from user_metadata
      const username = user.user_metadata?.username || '';
  
      const currentUser: User = {
        id: user.id,
        email: user.email || '',
        username: username,
      };
  
      // Display success toast message
      toast.success('Login successful!');
  
      // Stop loading to hide the spinner
      setLoading(false);
  
      // Delay before redirecting
      setTimeout(async () => {
        // Show spinner again over the login form during redirect
        setLoading(true);
  
        // Set the authenticated user in AuthContext
        setUser(currentUser);
  
        // Redirect logic
        try {
          const isOnboarded = await checkOnboardStatus(user.id);
          if (!isOnboarded) {
            router.push('/onboard');
          } else {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking onboard status:', error);
          setErrorMessage('An error occurred during login');
          setLoading(false);
        }
      }, 1000); // Adjust delay as needed
    } else {
      setErrorMessage('An unexpected error occurred');
      setLoading(false);
    }
  };
  
    

  // Handle password reset
  const handleForgotPassword = async () => {
   router.push('/reset-password')
    setLoading(false);
  };

  return (
    <>
      <div className={styles.formContainer}>
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
          <button
            type="button"
            className={styles.forgotPasswordButton}
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        </form>
  
        {loading && (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
  
      {/* Toast Container */}
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={true}
        theme="light"
      />
    </>
  );
  
};


export default LoginForm;
