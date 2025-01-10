import axios from 'axios';

export const getProjectUsers = async (projectId: string) => {
  try {
    const response = await axios.get(
      '/api/individualProjects/getUsersInProject',
      {
        params: { projectId },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to fetch project users.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};
