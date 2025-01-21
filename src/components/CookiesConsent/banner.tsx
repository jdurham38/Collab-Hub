'use client';

import React from 'react';
import Link from 'next/link';
import useCookieConsent from '@/hooks/cookies/useCookieConsent';
import styles from './CookieBanner.module.css';
import { Analytics } from "@vercel/analytics/react"; // Import Analytics

const CookieBanner: React.FC = () => {
  const { isCookieConsentGiven, handleAcceptCookies, handleDeclineCookies, analyticsEnabled, Analytics: AnalyticsComponent } = useCookieConsent();

  if (isCookieConsentGiven !== null) {
    return (
      <>
       {analyticsEnabled && <AnalyticsComponent />}
      </>
    );
  }

  return (
    <div
      className={styles.cookieBanner}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-heading"
    >
      <h2 id="cookie-banner-heading" className={styles.heading}>
        We Value Your Privacy
      </h2>
      <p className={styles.message}>
        We use cookies to enhance your experience, provide analytics, and
        remember your preferences. Please read our{' '}
        <Link href="/cookies-policy" className={styles.link}>
          Cookies Policy
        </Link>
        .
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