

import { User } from '@/utils/interfaces';
import axios from 'axios';

export const fetchProjectCollaborators = async (projectId: string): Promise<User[]> => {
  try {
    const response = await axios.get(`/api/projects/${projectId}/collaborators`);
    return response.data.collaborators;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while fetching project collaborators.');
    }
  }
};