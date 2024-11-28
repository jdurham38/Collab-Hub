import axios from 'axios';
import { UserData, SignupResponse } from '@/utils/interfaces';

export async function signup(userData: UserData): Promise<SignupResponse> {
  const userDataLower = {
    ...userData,
    email: userData.email.toLowerCase(),
  };

  try {
    const { data } = await axios.post<SignupResponse>('/api/signup', userDataLower);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || 'Failed to sign up');
    }
    throw new Error('An unexpected error occurred');
  }
}

export const checkUserExists = async (email: string): Promise<boolean> => {
  const emailLower = email.toLowerCase();

  try {
    const { data } = await axios.post<{ exists: boolean }>('/api/check-user', { email: emailLower });
    return data.exists;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error('Failed to check if user exists');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const { data } = await axios.post<{ exists: boolean }>('/api/check-username', { username });
    return data.exists;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error('Failed to check if username exists');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const checkOnboardStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await axios.post<{ isOnboarded: boolean }>('/api/is-onboarded', { userId });
    return data.isOnboarded;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error('Failed to check onboard status');
    }
    throw new Error('An unexpected error occurred');
  }
};
