import axios from 'axios';
const API_BASE_URL = '/api/projects-page';

export const applyToProject = async (
  projectId: string,
  userId: string,
): Promise<void> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/apply`, {
      projectId: projectId,
      userId: userId,
    });
    if (response.status !== 201) {
      throw new Error(
        `Failed to apply to project, status code: ${response.status}`,
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to apply to project';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while applying to the project.',
      );
    }
  }
};

export const checkApplicationStatus = async (
  projectId: string,
  userId: string,
): Promise<{ hasApplied: boolean }> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/check-application-status?projectId=${projectId}&userId=${userId}`,
    );

    if (response.status !== 200) {
      throw new Error(
        `Failed to check application status, status code: ${response.status}`,
      );
    }
    return { hasApplied: response.data.hasApplied };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to check application status';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while checking application status.',
      );
    }
  }
};
