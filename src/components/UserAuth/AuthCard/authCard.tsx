'use client';
import React, { useState } from 'react';
import LoginForm from '../Login/login';
import SignupForm from '../Signup/signup';
import styles from './AuthCard.module.css';

import logo from './logo.png';
import Image from 'next/image';

const AuthCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={styles.overlay}>
      <div
        className={`${styles.cardContainer} ${isFlipped ? styles.flipped : ''}`}
      >
        <div className={`${styles.card} ${styles.front}`}>
          <div className={styles.content}>
            <div className={styles.description}>
              <h2 className={styles.heading}>Welcome Back!</h2>
              <p className={styles.paragraph}>
                We’re glad to see you again! Enter your email and password to
                access your account and pick up right where you left off.
              </p>
              <Image src={logo} alt="Logo" className={styles.logo} />
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
              <h2 className={styles.heading}>Join Us!</h2>
              <p className={styles.paragraph}>
                Creating an account is quick and easy. Choose a unique username,
                enter your email, and create a secure password. Don&apos;t
                forget to accept our Terms and Conditions to get started.
                We&apos;ll walk you through every step to ensure your account is
                secure and ready.
              </p>
              <Image src={logo} alt="Logo" className={styles.logo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
