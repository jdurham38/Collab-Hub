'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './CookieBanner.module.css';

const CookieBanner: React.FC = () => {
  // Access Zustand store states and actions
  const isCookieConsentGiven = useAuthStore((state) => state.isCookieConsentGiven);
  const setCookieConsent = useAuthStore((state) => state.setCookieConsent);

  // Check local storage on component mount and update state accordingly
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted') {
      setCookieConsent(true); // Set consent to true if previously accepted
      initializeAnalytics();
    } else if (consent === 'declined') {
      setCookieConsent(false); // Set consent to false if previously declined
      removeAnalytics();
    } else {
      setCookieConsent(null); // Explicitly set to null if no preference found
    }
  }, [setCookieConsent]);

  // Handle accepting cookies
  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setCookieConsent(true);
    initializeAnalytics();
  };

  // Handle declining cookies
  const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setCookieConsent(false);
    removeAnalytics();
  };

  // Placeholder for initializing analytics
  const initializeAnalytics = () => {
    console.log('Analytics initialized');
    // Add your analytics initialization code here
  };

  // Placeholder for removing analytics
  const removeAnalytics = () => {
    console.log('Analytics removed');
    // Add your analytics removal code here
  };

  // Show the banner only if consent has not been given (i.e., isCookieConsentGiven is null)
  if (isCookieConsentGiven === null) {
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
  }

  // Return null to hide the banner if consent is given (either accepted or declined)
  return null;
};

export default CookieBanner;
