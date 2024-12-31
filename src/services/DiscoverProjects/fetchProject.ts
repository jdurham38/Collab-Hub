import axios from 'axios';

export const fetchAllUserProjects = async (userId: string) => {
  try {
    const response = await axios.get(`/api/projects-page/fetch-all-projects?userId=${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'failed to fetch projects';
      throw new Error(errorMessage);
    } else {
      throw new Error('an unexpected error has occurred');
    }
  }
};