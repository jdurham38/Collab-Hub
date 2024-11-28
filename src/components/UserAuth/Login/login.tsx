'use client';

import React, { useState } from 'react';
import { UserData } from '@/utils/interfaces'; 
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore'; 
import styles from './LoginForm.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { setLoggedIn } = useAuthStore(); 
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

    const { error } = await supabase.auth.signInWithPassword(userData);

    if (error) {
      setErrorMessage('Login failed, either password or email is incorrect');
      setLoading(false);
      return;
    }

    
    toast.success('Login successful!');

    
    setLoggedIn(true);

    
    setLoading(false);

    
    setTimeout(() => {
      
      setLoading(true);

      
      router.push('/dashboard');
    }, 1000); 
  };

  
  const handleForgotPassword = async () => {
    router.push('/reset-password');
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
