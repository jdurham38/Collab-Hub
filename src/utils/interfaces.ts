// utils/interfaces.ts

export interface UserData {
    email: string;
    password: string;
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
  