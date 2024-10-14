'use client';

import React, { useState } from 'react';
import supabase from '@/lib/supabaseClient/supabase';
import styles from './ResetPassword.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State to store error messages

  const validateEmail = (email: string) => {
    return emailRegex.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    // Validate email format before proceeding
    if (!validateEmail(email)) {
      setErrorMessage('Invalid email format');
      setLoading(false);
      return;
    }

    // Check if the email exists in the system
    const { data: userData, error: userCheckError } = await supabase
      .from('users') // Ensure this is your actual user table
      .select('email')
      .eq('email', email)
      .single();

    if (userCheckError || !userData) {
      setErrorMessage('Email does not exist in our records');
      setLoading(false);
      return;
    }

    // Proceed with password reset if email exists
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Ensure this URL is configured in Supabase
    });

    if (error) {
      setErrorMessage('Error sending password reset email');
    } else {
      toast.success('Password reset email sent successfully!'); // Ensure toast is shown after success
    }

    setLoading(false);
  };

  return (
    <div className={styles.overlay}>
      {loading ? (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <div className={styles.description}>
              <h2>Reset Your Password</h2>
              <p>Enter your email to reset your password and get back to your projects.</p>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleResetPassword} className={styles.form}>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(''); // Clear error when typing
                  }}
                  placeholder="Enter your email"
                  required
                />
                {/* Display error message inline */}
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}

                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ToastContainer should always be rendered to ensure toast works */}
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={true}
        theme="light"
      />
    </div>
  );
};

export default ResetPasswordPage;
