import axios from 'axios';

export const checkPlanAndProjects = async (userId: string): Promise<void> => {
  try {
    await axios.get(`/api/projects/check-plan-and-projects`, {
      params: { userId },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error; // Let the caller handle Axios-specific errors
    } else {
      throw new Error('An unexpected error occurred while checking your plan.');
    }
  }
};
