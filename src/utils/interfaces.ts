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


export interface Message {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  channel_id: string;
  edited?: boolean;
  users?: {
    username: string;
    email: string;
  };
}

// File: /types/index.ts

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Add any additional fields as necessary
}



export interface Collaborator {
  userId: string;
  adminPrivileges: boolean;
  username?: string;
  email?: string;
  // Add any additional fields as necessary
}