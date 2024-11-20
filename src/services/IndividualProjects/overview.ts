import axios from 'axios';

export const getProjectOverview = async (projectId: string) => {
  try {
    const response = await axios.get('/api/individualProjects/overview', {
      params: { projectId },
    });

    return response.data.project;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch project overview.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};
