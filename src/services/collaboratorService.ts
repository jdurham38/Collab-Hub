import axios from 'axios';
import { Collaborator, User } from '@/utils/interfaces';

interface FetchProjectCollaboratorsResponse {
    collaborators: Collaborator[];
    projectOwner: User | null;
    userIsOwner: boolean;
}

export const fetchProjectCollaborators = async (
  projectId: string
): Promise<FetchProjectCollaboratorsResponse> => {
  try {
    const response = await axios.get(      `/api/projects/${projectId}/collaborators`,
    );
    
      return response.data;
  } catch (error:any) {
      console.error('Error fetching project collaborators:', error);
    throw error;
  }
};