'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CookieBanner.module.css';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        setShowBanner(true);
      } else if (consent === 'accepted') {
        initializeAnalytics();
      }
    }
  }, []);

  const handleAcceptCookies = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', 'accepted');
      setShowBanner(false);
      initializeAnalytics();
    }
  };

  const handleDeclineCookies = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', 'declined');
      setShowBanner(false);
      removeAnalytics();
    }
  };

  const initializeAnalytics = () => {
    console.log('Analytics initialized');
    // Initialize analytics here
  };

  const removeAnalytics = () => {
    console.log('Analytics removed');
    // Remove analytics here
  };

  if (!showBanner) return null;

  return (
    <div className={styles.cookieBanner}>
      <p className={styles.message}>
        We use cookies for analytics and to remember your preferences. Read our{' '}
        <Link href="/cookies-policy" className={styles.link}>
        Cookies Policy
        </Link>
        . Do you accept the use of cookies?
      </p>
      <div className={styles.buttonContainer}>
        <button onClick={handleAcceptCookies} className={styles.button}>
          Accept
        </button>
        <button onClick={handleDeclineCookies} className={styles.button}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
