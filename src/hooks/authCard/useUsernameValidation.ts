
import { useState, useEffect } from 'react';
import { checkUsernameExists } from '@/services/signup';
import { profanity } from '@2toad/profanity';

interface UseUsernameValidationProps {
  username: string;
}

interface UseUsernameValidationReturn {
  isValid: boolean;
  isChecking: boolean;
  error: string;
}

const useUsernameValidation = ({ username }: UseUsernameValidationProps): UseUsernameValidationReturn => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const validateUsername = async () => {
      const trimmedUsername = username.trim();

      if (trimmedUsername === '') {
        setIsValid(false);
        setError('');
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      setError('');

      
      try {
        if (profanity.exists(trimmedUsername)) {
          setError('Profanity detected in username.');
          setIsValid(false);
          setIsChecking(false);
          return;
        }
      } catch (profanityError: unknown) {
        console.error('Error checking profanity in username:', profanityError);
        setError('Error checking username for profanity.');
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      
      try {
        const usernameExists = await checkUsernameExists(trimmedUsername);
        if (usernameExists) {
          setError('Username is already taken.');
          setIsValid(false);
        } else {
          setIsValid(true);
          setError('');
        }
      } catch (availabilityError: unknown) {
        console.error('Error checking username availability:', availabilityError);
        setError('Error checking username availability.');
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(() => {
      validateUsername();
    }, 1500); 

    return () => clearTimeout(timer);
  }, [username]);

  return { isValid, isChecking, error };
};

export default useUsernameValidation;
