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
        const response = await axios.get(
          `/api/projects/${projectId}/collaborators`,
        );

        return response.data;
    } catch (error) {
       if (axios.isAxiosError(error)) {
           console.error('Error fetching project collaborators:', error.message);
           throw error;
       } else if (error instanceof Error) {
             console.error('Error fetching project collaborators:', error.message);
           throw error;
        } else {
           console.error('An unknown error occurred while fetching project collaborators:', error);
           throw new Error('An unknown error occurred');
        }
    }
};