import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const COOKIE_CONSENT_KEY = 'cookieConsent';

const useCookieConsent = () => {
  const isCookieConsentGiven = useAuthStore(
    (state) => state.isCookieConsentGiven,
  );
  const setCookieConsent = useAuthStore((state) => state.setCookieConsent);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false); // New state

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent === 'accepted') {
      setCookieConsent(true);
      setAnalyticsEnabled(true); // Set analytics enabled if consent given
      // initializeAnalytics(); // initialization for external analytics like google analytics can be placed here
    } else if (consent === 'declined') {
      setCookieConsent(false);
      setAnalyticsEnabled(false);
      // removeAnalytics();  // initialization for removing external analytics like google analytics can be placed here
    } else {
      setCookieConsent(null);
      setAnalyticsEnabled(false);
    }
  }, [setCookieConsent]);

  const handleAcceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setCookieConsent(true);
    setAnalyticsEnabled(true);
    // initializeAnalytics();
  };

  const handleDeclineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setCookieConsent(false);
    setAnalyticsEnabled(false);
    // removeAnalytics();
  };

  return {
    isCookieConsentGiven,
    handleAcceptCookies,
    handleDeclineCookies,
    analyticsEnabled, // Added to return the state
    Analytics, // Added to return the Analytics Component
  };
};

export default useCookieConsent;