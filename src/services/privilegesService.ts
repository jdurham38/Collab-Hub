// services/privilegesService.ts

import axios from 'axios';

export const validatePrivileges = async (projectId: string, userId: string): Promise<boolean> => {
  try {
    const response = await axios.post(`/api/projects/${projectId}/validatePrivileges`, {
      userId,
    });
    return response.data.canCreateChannel;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to validate privileges.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while validating privileges.');
    }
  }
};


