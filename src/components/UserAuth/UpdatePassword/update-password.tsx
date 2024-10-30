'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import { useRouter } from 'next/navigation';
import styles from './UpdatePassword.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoAlertCircleOutline } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

const UpdatePasswordPage: React.FC = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [isPasswordValid, setIsPasswordValid] = useState(false); // Password validation state
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState(''); // Password success message
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get the session to ensure the user is authenticated
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // If no session, redirect to login page
        router.push('/');
      }
    };

    getSession();
  }, [router]);

  // Function to validate password
  const validatePassword = (password: string) => {
    const isValid = passwordRegex.test(password);
    setIsPasswordValid(isValid);

    if (isValid) {
      setPasswordSuccessMessage('Wow, that’s a good password!');
    } else {
      setPasswordSuccessMessage('');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    const supabase = getSupabaseClient();
    e.preventDefault();

    // Validate password format
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      // Check for the specific error code 422 and handle it
      if (error.status === 422) {
        setErrorMessage('You cannot reuse a previous password. Please try a new one.');
      } else {
        toast.error('Error updating password');
      }
    } else {
      toast.success('Password updated successfully');
      // Delay redirect to allow the toast message to show
      setTimeout(() => {
        router.push('/');
      }, 5000); // 5 seconds delay
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
              <h2>Update Your Password</h2>
              <p>Set a new password to secure your account.</p>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleUpdatePassword} className={styles.form}>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validatePassword(e.target.value); // Validate password structure as the user types
                    }}
                    placeholder="Enter your new password"
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
                {!isPasswordValid && (
                  <p className={styles.warning}>
                    <IoAlertCircleOutline className={styles.alert} />
                    Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character
                  </p>
                )}
                {passwordSuccessMessage && <p className={styles.success}>{passwordSuccessMessage}</p>}

                <button className={styles.button} type="submit" disabled={loading || !isPasswordValid}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              </form>
              <ToastContainer
                position="top-left"
                autoClose={5000}
                hideProgressBar={true}
                theme="light"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePasswordPage;
