import { UserData, SignupResponse } from '@/utils/interfaces';

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
