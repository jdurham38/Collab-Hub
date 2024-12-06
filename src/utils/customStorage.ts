import { SupportedStorage } from '@supabase/auth-js';

const customStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    if (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    ) {
      const consent = localStorage.getItem('cookieConsent');
      if (consent === 'accepted') {
        return localStorage.getItem(key);
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    ) {
      const consent = localStorage.getItem('cookieConsent');
      if (consent === 'accepted') {
        localStorage.setItem(key, value);
      }
    }
  },
  removeItem: (key: string): void => {
    if (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    ) {
      localStorage.removeItem(key);
    }
  },
};

export default customStorage;
