import axios from 'axios';

export const getUserProjects = async (userId: string) => {
  try {
    const response = await axios.get(`/api/projects/user-projects?userId=${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'failed to fetch the user projects';
      throw new Error(errorMessage);
    } else {
      throw new Error('an unexpected error has occurred');
    }
  }
};