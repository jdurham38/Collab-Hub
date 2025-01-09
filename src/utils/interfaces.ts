

export interface UserData {
  email: string;
  password: string;
  username?: string;
  role?: string;
  profileImageUrl: string;
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
    role: string;
  };
  error?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
  shortBio?: string;
  bio?: string;
  personalWebsite?: string;
  instagramLink?: string;
  linkedinLink?: string;
  behanceLink?: string;
  twitterLink?: string;
  tiktokLink?: string;
  cookieConsent?: boolean;
  profileImageUrl: string;
}


export interface Project {
  id: string;
  title: string;
  description: string;
  banner_url: string;
  tags: string[];
  roles: string[];
  created_by: string;
  createdAt: string
  created_by_username: string;
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



export interface Channel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  
}

export interface Collaborator {
  id: string;
  userId: string;
  adminPrivileges: boolean;
  username: string;
  email: string;
  canRemoveUser: boolean;
  canRemoveChannel: boolean;
  canEditProject: boolean;
  canEditAdminAccess: boolean;
  
}

export interface DirectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  edited: boolean;
}