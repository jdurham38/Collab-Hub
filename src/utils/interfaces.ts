// utils/interfaces.ts

export interface UserData {
    email: string;
    password: string;
    username: string;
  }
  
  export interface ProfileData {
    firstName: string;
    lastName: string;
    bio?: string;
  }
  
  export interface AuthResponse {
    user: {
      id: string;
      email: string;
    };
    token: string;
  }

  // Define the expected shape of the API response
export interface SignupResponse {
  message: string;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}
  