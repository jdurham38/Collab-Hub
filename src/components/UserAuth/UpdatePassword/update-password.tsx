'use client';

import React, { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import { useRouter } from 'next/navigation';
import styles from './UpdatePassword.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\\/?]).{6,}$/;

const UpdatePasswordPage: React.FC = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  
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
    e.preventDefault();

    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character');
      return;
    }

    setLoading(true);
    const supabase = getSupabaseClient();

    try {
      console.log('Attempting to update password...');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      console.log('Password update response:', error);

      
      if (error) {
        if (error.status === 422) {
          setErrorMessage('You cannot reuse a previous password. Please try a new one.');
        } else {
          setErrorMessage('Error updating password. Please try again.');
        }
        setLoading(false); 
        return;
      }

      
      toast.success('Password updated successfully');
      
      setTimeout(() => {
        router.push('/'); 
      }, 3000); 
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('An unexpected error occurred. Please try again later.');
      setLoading(false); 
    }
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
              <p>
                Create a strong and secure password to protect your account. Your new password should
                include at least one uppercase letter, one number, and one special character, and be at
                least 6 characters long. As you type, we&apos;ll guide you on how secure your password is.
              </p>
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
                      validatePassword(e.target.value);
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
                    Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1
                    special character
                  </p>
                )}
                {passwordSuccessMessage && <p className={styles.success}>{passwordSuccessMessage}</p>}

                <button className={styles.button} type="submit" disabled={loading || !isPasswordValid}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              </form>
              <ToastContainer position="top-left" autoClose={5000} hideProgressBar theme="light" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePasswordPage;
