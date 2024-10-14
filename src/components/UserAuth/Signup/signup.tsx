'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, SignupResponse } from '@/utils/interfaces';
import { useAuth } from '@/contexts/AuthContext';
import { signup, checkUserExists, checkUsernameExists, checkOnboardStatus } from '@/services/signup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoAlertCircleOutline } from "react-icons/io5";
import { profanity } from '@2toad/profanity';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from './SignupForm.module.css';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const SignupForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Error message state for general errors
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false); // New state for checkbox
  const [acceptTermsError, setAcceptTermsError] = useState(false); // State to track checkbox error
  const [passwordError, setPasswordError] = useState(''); // State to track password error
  const [redirecting, setRedirecting] = useState(false);
  const { setUser } = useAuth();

  // Username validation with profanity check and username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (username.trim() === '') {
        setUsernameAvailable(false);
        return;
      }

      setUsernameChecking(true);

      try {
        if (profanity.exists(username)) {
          setErrorMessage('Profanity detected in username');
          setUsernameAvailable(false);
          setUsernameChecking(false);
          return;
        }
      } catch (error: unknown) {
        console.error('Error checking profanity in username:', error);
        setErrorMessage('Error checking username for profanity');
        setUsernameAvailable(false);
        setUsernameChecking(false);
        return;
      }

      try {
        const usernameExists = await checkUsernameExists(username);
        if (usernameExists) {
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable(true);
          setErrorMessage('');
        }
      } catch (error: unknown) {
        console.error('Error checking username availability:', error);
        setErrorMessage('Error checking username availability');
        setUsernameAvailable(false);
      } finally {
        setUsernameChecking(false);
      }
    };

    const timer = setTimeout(() => {
      checkUsername();
    }, 1500);

    return () => clearTimeout(timer);
  }, [username]);

  const validateEmail = (email: string) => {
    setIsEmailValid(emailRegex.test(email));
  };

  const validatePassword = (password: string) => {
    const isValid = passwordRegex.test(password);
    setIsPasswordValid(isValid);

    if (isValid) {
      setPasswordSuccessMessage('Wow, that’s a good password!');
      setPasswordError(''); // Clear password error when valid
    } else {
      setPasswordSuccessMessage('');
      setPasswordError('Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    let formIsValid = true;

    // Clear previous errors
    setErrorMessage('');
    setPasswordError('');
    setAcceptTermsError(false);

    // Validate email format
    if (!isEmailValid) {
      setErrorMessage('Invalid email format');
      formIsValid = false;
    }

    // Validate password format
    if (!isPasswordValid) {
      setPasswordError('Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character.');
      formIsValid = false;
    }

    // Check if username is available
    if (!usernameAvailable) {
      setErrorMessage('Please choose a different username');
      formIsValid = false;
    }

    // Check if Terms and Conditions are accepted
    if (!acceptTerms) {
      setAcceptTermsError(true);
      formIsValid = false;
    }

    // If any validation failed, stop submission
    if (!formIsValid) {
      return;
    }

    setLoading(true);

    try {
      const userExists = await checkUserExists(email);
      if (userExists) {
        setErrorMessage('This email is already registered');
        setLoading(false);
        return;
      }

      const userData: UserData = {
        email,
        password,
        username,
      };

      const result: SignupResponse = await signup(userData);

      if (result) {
        toast.success('Signup successful!');
        setUser(result.user ? result.user : null);
        setUserName('');
        setEmail('');
        setPassword('');
        setPasswordSuccessMessage('');
      }
      
      const isOnboarded = await checkOnboardStatus(result.user?.id || '');
      
      if (!isOnboarded) {
        setRedirecting(true);
        // Delay the redirect to allow the toast to display
        setTimeout(() => {
          router.push('/onboard');
        }, 2000); // Adjust the delay as needed (e.g., 2000ms = 2 seconds)
      }
      
      setErrorMessage('');
    } catch (error: unknown) {
      console.error('Error during signup:', error);
      setErrorMessage('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {redirecting ? (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <>
        <form onSubmit={handleSignup} className={styles.form} noValidate>            <input
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Username"
              required
            />
            {usernameChecking && <p>Checking username availability...</p>}
            {!usernameChecking && username && usernameAvailable && <p className={styles.success}>Username is available!</p>}
            {!usernameChecking && username && !usernameAvailable && <p className={styles.error}>Username is not available</p>}

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              placeholder="Email"
              required
            />
            {!isEmailValid && <p className={styles.error}>Invalid email format</p>}

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
            {passwordError && (
              <p className={styles.warning}>
                <IoAlertCircleOutline className={styles.alert} />
                {passwordError}
              </p>
            )}
            {passwordSuccessMessage && <p className={styles.success}>{passwordSuccessMessage}</p>}

            {/* Terms and Conditions Checkbox */}
            <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              required
            />
            <label htmlFor="acceptTerms">
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
              </a>.
            </label>
          </div>

            {acceptTermsError && <p className={styles.error}>You must accept the Terms and Conditions and Privacy Policy to proceed.</p>}

            <button type="submit" disabled={loading || usernameChecking}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          </form>

          <ToastContainer position="top-left" autoClose={5000} hideProgressBar={true} theme="light" />
        </>
      )}
    </>
  );
};

export default SignupForm;
