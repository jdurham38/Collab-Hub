'use client';

import React, { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './ResetPassword.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const supabase = getSupabaseClient();

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 

  const validateEmail = (email: string) => {
    return emailRegex.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); 

    
    if (!validateEmail(email)) {
      setErrorMessage('Invalid email format');
      setLoading(false);
      return;
    }

    
    const { data: userData, error: userCheckError } = await supabase
      .from('users') 
      .select('email')
      .eq('email', email)
      .single();

    if (userCheckError || !userData) {
      setErrorMessage('Email does not exist in our records');
      setLoading(false);
      return;
    }

    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, 
    });

    if (error) {
      setErrorMessage('Error sending password reset email');
    } else {
      toast.success('Password reset email sent successfully!'); 
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
              <p>We understand that forgetting a password can be stressful. Enter your email, and we’ll send you a link to securely reset your password so you can get back to what matters most.</p>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleResetPassword} className={styles.form}>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(''); 
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
