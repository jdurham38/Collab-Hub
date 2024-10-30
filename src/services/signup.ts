import { UserData, SignupResponse } from '@/utils/interfaces';

// Signup function
// Signup function
export async function signup(userData: UserData): Promise<SignupResponse> {
  // Convert the email to lowercase
  const userDataLower = {
    ...userData,
    email: userData.email.toLowerCase(),
  };

  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Use the userData with lowercase email
    body: JSON.stringify(userDataLower),
  });

  const result: SignupResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to sign up');
  }

  return result;
}


// Check if the user already exists by email
// Check if the user already exists by email
export const checkUserExists = async (email: string): Promise<boolean> => {
  // Convert the email to lowercase
  const emailLower = email.toLowerCase();

  const response = await fetch('/api/check-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Use the lowercase email in the request body
    body: JSON.stringify({ email: emailLower }),
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
