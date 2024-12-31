
import axios from 'axios';

/**
 * Removes a collaborator from a project.
 * @param projectId - The ID of the project.
 * @param userId - The ID of the user to remove.
 * @param requesterId - The ID of the user performing the removal.
 */
export async function removeCollaborator(
  projectId: string,
  userId: string,
  requesterId: string
): Promise<void> {
  try {
    await axios.delete(`/api/projects/${projectId}/collaborators/${userId}`, {
      data: { requesterId }, 
      headers: {
        'Content-Type': 'application/json', 
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to remove collaborator';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}
