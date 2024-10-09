import { UserData, SignupResponse } from '@/utils/interfaces';

// Signup function
export async function signup(userData: UserData): Promise<SignupResponse> {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result: SignupResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to sign up');
  }

  return result;
}

// Check if the user already exists by email
export const checkUserExists = async (email: string) => {
  const response = await fetch('/api/check-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();
  return result.exists; // returns true if user exists, false otherwise
};

// Check if the username already exists
export const checkUsernameExists = async (username: string) => {
  const response = await fetch('/api/check-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  const result = await response.json();
  return result.exists; // returns true if username exists, false otherwise
};

// Check if the user is onboarded
export const checkOnboardStatus = async (userId: string) => {
  const response = await fetch('/api/is-onboarded', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),  // Pass user ID
  });

  const result = await response.json();
  return result.isOnboarded; // returns true if user is onboarded, false otherwise
};
