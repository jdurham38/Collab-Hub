"use client"
import React, { useState } from 'react';
import LoginForm from '../Login/login';
import SignupForm from '../Signup/signup';
import styles from './AuthCard.module.css';

const AuthCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.cardContainer} ${isFlipped ? styles.flipped : ''}`}>
        <div className={`${styles.card} ${styles.front}`}>
          <div className={styles.content}>
            <div className={styles.description}>
              <h2>Welcome Back!</h2>
              <p>Login to access your account.</p>
            </div>
            <div className={styles.formContainer}>
              <LoginForm />
              <button className={styles.flipButton} onClick={handleFlip}>
                New user?
              </button>
            </div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.back}`}>
          <div className={styles.content}>
            <div className={styles.formContainer}>
              <SignupForm />
              <button className={styles.flipButton} onClick={handleFlip}>
                Already have an account?
              </button>
            </div>
            <div className={styles.description}>
              <h2>Join Us!</h2>
              <p>Sign up to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
