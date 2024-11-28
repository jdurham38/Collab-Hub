// utils/interfaces.ts

export interface UserData {
    email: string;
    password: string;
    username?: string;
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

export interface SignupResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  error?: string;
}
  

export interface User {
  id: string;
  email: string;
  username: string;
  cookieConsent?: boolean;
}

// Project.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  banner_url: string;
  tags: string[];
  roles: string[];
}

