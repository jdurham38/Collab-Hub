// hooks/useCookieConsent.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const COOKIE_CONSENT_KEY = 'cookieConsent';

const useCookieConsent = () => {
  const isCookieConsentGiven = useAuthStore((state) => state.isCookieConsentGiven);
  const setCookieConsent = useAuthStore((state) => state.setCookieConsent);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent === 'accepted') {
      setCookieConsent(true);
      initializeAnalytics();
    } else if (consent === 'declined') {
      setCookieConsent(false);
      removeAnalytics();
    } else {
      setCookieConsent(null);
    }
  }, [setCookieConsent]);

  const handleAcceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setCookieConsent(true);
    initializeAnalytics();
  };

  const handleDeclineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setCookieConsent(false);
    removeAnalytics();
  };

  const initializeAnalytics = () => {
    console.log('Analytics initialized');
    // Add your analytics initialization logic here
  };

  const removeAnalytics = () => {
    console.log('Analytics removed');
    // Add your analytics removal logic here
  };

  return {
    isCookieConsentGiven,
    handleAcceptCookies,
    handleDeclineCookies,
  };
};

export default useCookieConsent;
