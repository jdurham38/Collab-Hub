'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, SignupResponse } from '@/utils/interfaces';
import { useAuth } from '@/contexts/AuthContext';
import { signup, checkUserExists, checkUsernameExists, checkOnboardStatus } from '@/services/signup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { profanity } from '@2toad/profanity'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



import styles from './SignupForm.module.css';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const SignupForm: React.FC = () => {
  const router = useRouter(); // Initialize the router directly in the component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const { setUser } = useAuth();

  useEffect(() => {
    // Debounced username check after user stops typing for 1 second
    const checkUsername = async () => {
      if (username.trim() === '') {
        setUsernameAvailable(false); // If the username is empty, reset availability
        return;
      }

      setUsernameChecking(true);

      try {
        // Check for profanity first
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
        // Check if the username already exists
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

    // Set a timeout to check username 1 second after typing stops
    const timer = setTimeout(() => {
      checkUsername();
    }, 1500);

    // Clear the timer if the user types again before the timeout
    return () => clearTimeout(timer);
  }, [username]);

  // Function to validate email structure
  const validateEmail = (email: string) => {
    setIsEmailValid(emailRegex.test(email));
  };

  // Function to validate password structure
  const validatePassword = (password: string) => {
    const isValid = passwordRegex.test(password);
    setIsPasswordValid(isValid);

    if (isValid) {
      setPasswordSuccessMessage('Wow, that’s a good password!');
    } else {
      setPasswordSuccessMessage('');
    }
  };

  // Function to handle form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!isEmailValid) {
      setErrorMessage('Invalid email format');
      return;
    }

    // Validate password format
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character');
      return;
    }

    // If username is not available, prevent submission
    if (!usernameAvailable) {
      setErrorMessage('Please choose a different username');
      return;
    }

    setLoading(true); // Start loading when checks begin

    try {
      // Check if the user already exists
      const userExists = await checkUserExists(email);
      if (userExists) {
        setErrorMessage('This email is already registered');
        setLoading(false);
        return;
      }

      // If no errors exist, proceed with signup
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

      // Check if the user is onboarded
      const isOnboarded = await checkOnboardStatus(result.user?.id || '');

      // If not onboarded, redirect to the onboarding page
      if (!isOnboarded) {
        setRedirecting(true);
        router.push('/onboard');
      }

      setErrorMessage(''); // Clear previous error
    } catch (error: unknown) {
      console.error('Error during signup:', error); // Log the error
      setErrorMessage('An error occurred during signup');
    } finally {
      setLoading(false); // Stop loading after process completes
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
      <form onSubmit={handleSignup} className={styles.form}>
        <input
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
            validateEmail(e.target.value); // Validate email structure as the user types
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
              validatePassword(e.target.value); // Validate password structure as the user types
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
        {!isPasswordValid && <p className={styles.error}>Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 special character</p>}
        {passwordSuccessMessage && <p className={styles.success}>{passwordSuccessMessage}</p>}

        <button type="submit" disabled={loading || usernameChecking || !isEmailValid || !isPasswordValid}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </form>

      {/* Toast Container */}
      <ToastContainer 
      position='top-left'
      autoClose={5000}
      hideProgressBar={true}
      theme='light'
      />
      </>
    )}
  </>
);
};

export default SignupForm;
