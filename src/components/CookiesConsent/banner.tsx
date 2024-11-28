'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './CookieBanner.module.css';

const CookieBanner: React.FC = () => {
    const isCookieConsentGiven = useAuthStore((state) => state.isCookieConsentGiven);
  const setCookieConsent = useAuthStore((state) => state.setCookieConsent);

    useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted') {
      setCookieConsent(true);       initializeAnalytics();
    } else if (consent === 'declined') {
      setCookieConsent(false);       removeAnalytics();
    } else {
      setCookieConsent(null);     }
  }, [setCookieConsent]);

    const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setCookieConsent(true);
    initializeAnalytics();
  };

    const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setCookieConsent(false);
    removeAnalytics();
  };

    const initializeAnalytics = () => {
    console.log('Analytics initialized');
      };

    const removeAnalytics = () => {
    console.log('Analytics removed');
      };

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

    return null;
};

export default CookieBanner;
