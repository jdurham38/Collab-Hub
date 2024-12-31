
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, SignupResponse } from '@/utils/interfaces';
import { signup, checkUserExists } from '@/services/signup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useUsernameValidation from '@/hooks/authCard/useUsernameValidation';
import styles from './SignupForm.module.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const SignupForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUserName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [acceptTermsError, setAcceptTermsError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  
  const { isValid: isUsernameValid, isChecking: isUsernameChecking, error: usernameError } = useUsernameValidation({
    username,
  });

  
  useEffect(() => {
    if (usernameError) {
      setErrorMessage(usernameError);
    } else {
      setErrorMessage('');
    }
  }, [usernameError]);

  
  const validateEmail = (emailInput: string) => {
    const valid = emailRegex.test(emailInput);
    setIsEmailValid(valid);
  };

  
  const validatePassword = (passwordInput: string) => {
    const valid = passwordRegex.test(passwordInput);
    setIsPasswordValid(valid);

    if (valid) {
      setPasswordSuccessMessage("Wow, that’s a good password!");
      setPasswordError('');
    } else {
      setPasswordSuccessMessage('');
      setPasswordError(
        'Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character.'
      );
    }
  };

  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    let formIsValid = true;

    
    setErrorMessage('');
    setPasswordError('');
    setAcceptTermsError(false);

    const emailLower = email.toLowerCase();

    
    if (!emailRegex.test(emailLower)) {
      setErrorMessage('Please enter a valid email address.');
      formIsValid = false;
    }

    
    if (!isPasswordValid) {
      setPasswordError(
        'Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character.'
      );
      formIsValid = false;
    }

    
    if (!isUsernameValid) {
      setErrorMessage('Sorry, this username is already taken or invalid. Please try another.');
      formIsValid = false;
    }

    
    if (!acceptTerms) {
      setAcceptTermsError(true);
      formIsValid = false;
    }

    if (!formIsValid) {
      return;
    }

    setLoading(true);

    try {
      
      const userExists = await checkUserExists(emailLower);
      if (userExists) {
        setErrorMessage('This email is already registered. Try logging in instead.');
        setLoading(false);
        return;
      }

      
      const userData: UserData = {
        email: emailLower,
        password,
        username,
      };

      
      const result: SignupResponse = await signup(userData);

      if (result.error) {
        setErrorMessage(result.error);
        setLoading(false);
        return;
      }

      if (result.user) {
        toast.success('Signup successful! Please check your email to confirm your address.');
        
        setUserName('');
        setEmail('');
        setPassword('');
        setPasswordSuccessMessage('');
        setErrorMessage('');

        
        router.push('/verify-email');
      } else {
        setErrorMessage('An unexpected error occurred during signup.');
      }
    } catch (error: unknown) {
      console.error('Error during signup:', error);
      setErrorMessage('An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignup} className={styles.form} noValidate>
        {}
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            required
            className={styles.input}
            aria-describedby="username-error username-success"
          />
          {isUsernameChecking && <p className={styles.info}>Checking username availability...</p>}
          {!isUsernameChecking && username && isUsernameValid && (
            <p id="username-success" className={styles.success}>
              Great choice! Your username is available.
            </p>
          )}
          {!isUsernameChecking && username && !isUsernameValid && (
            <p id="username-error" className={styles.error}>
              {errorMessage || 'Sorry, this username is already taken. Please try another.'}
            </p>
          )}
        </div>

        {}
        <div className={styles.inputGroup}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            placeholder="Email"
            required
            className={styles.input}
            aria-describedby="email-error"
          />
          {!isEmailValid && (
            <p id="email-error" className={styles.error}>
              Invalid email format. Please double-check your email address.
            </p>
          )}
        </div>

        {}
        <div className={styles.inputGroup}>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="Password"
              required
              className={styles.input}
              aria-describedby="password-error password-success"
            />
            <button
              type="button"
              className={styles.passwordToggleButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className={styles.error}>
              <IoAlertCircleOutline className={styles.alertIcon} />
              {passwordError}
            </p>
          )}
          {passwordSuccessMessage && (
            <p id="password-success" className={styles.success}>
              {passwordSuccessMessage}
            </p>
          )}
        </div>

        {}
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={() => setAcceptTerms(!acceptTerms)}
            required
            className={styles.checkbox}
          />
          <label htmlFor="acceptTerms" className={styles.label}>
            By clicking this you agree to our{' '}
            <a
              href="/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>
        {acceptTermsError && (
          <p className={styles.error}>
            You must accept the Terms and Conditions and Privacy Policy to proceed.
          </p>
        )}

        {}
        <button type="submit" disabled={loading || isUsernameChecking} className={styles.submitButton}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        {}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </form>

      {}
      <ToastContainer position="top-left" autoClose={5000} hideProgressBar={true} theme="light" />
    </>
  );
};

export default SignupForm;
