import axios from 'axios';
import { Collaborator } from '@/utils/interfaces';
// services/ProjectSettings/adminAccess.ts



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
  fields: { // Accept an object containing all fields
    adminPrivileges?: boolean;
    canRemoveUser?: boolean;
    canRemoveChannel?: boolean;
    canEditProject?: boolean;
    canEditAdminAccess?: boolean;
  }
): Promise<Collaborator> => {
  try {
    const response = await axios.patch(
      `/api/projects/${projectId}/collaborators/${userId}`,
      fields // Send the entire fields object
    );
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
