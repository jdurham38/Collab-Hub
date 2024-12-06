// File: services/collaboratorService.ts

import axios from 'axios';
import { User } from '@/utils/interfaces';

export const fetchProjectCollaborators = async (
  projectId: string,
): Promise<User[]> => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    const response = await axios.get(
      `/api/projects/${projectId}/collaborators`,
    );
    return response.data.collaborators;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to fetch collaborators.';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while fetching collaborators.',
      );
    }
  }
};
