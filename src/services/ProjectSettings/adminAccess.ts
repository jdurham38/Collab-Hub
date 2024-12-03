import axios from 'axios';

// services/ProjectSettings/adminAccess.ts

export interface Collaborator {
  userId: string;
  adminPrivileges: boolean;
  username?: string;
  email?: string;
  // Add any additional fields as necessary
}


export const fetchCollaborators = async (projectId: string): Promise<Collaborator[]> => {
  try {
    const response = await axios.get(`/api/projects/${projectId}/collaborators`);
    return response.data.collaborators;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch collaborators';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error has occurred');
    }
  }
};

export const toggleAdminAccess = async (
  projectId: string,
  userId: string,
  adminPrivileges: boolean
): Promise<Collaborator> => {
  try {
    const response = await axios.patch(`/api/projects/${projectId}/collaborators/${userId}`, {
      adminPrivileges,
    });
    return response.data.collaborator;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to update admin privileges';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error has occurred');
    }
  }
};
