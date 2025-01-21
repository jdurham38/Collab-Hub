import axios, { AxiosError } from 'axios';
import { ProjectInvite } from '@/utils/interfaces';

const API_URL = '/api/project-invites/send-invite'; // Use the correct API_URL
const COLLABORATOR_API_URL = '/api/project-invites/project-collaborators';
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

interface ErrorResponse {
  error: string;
}


export const projectInviteFetchService = {
    getProjectInvites: async (options: {
        project_id?: string;
        user_id?: string;
        status?: string;
    }): Promise<ProjectInvite[]> => {
        try {
            const response = await axios.get<ProjectInvite[]>(API_URL, {
                params: options
            });

           return response.data
        } catch (error) {
            return handleAxiosError(error as AxiosError<ErrorResponse>);
        }
    },
    getProjectCollaborators: async (user_id: string): Promise<string[]> => {
        try {
            const response = await axios.get<string[]>(COLLABORATOR_API_URL, {
                params: { user_id }
            });
            return response.data
        } catch (error) {
            return handleAxiosError(error as AxiosError<ErrorResponse>);
        }
    },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleAxiosError(error: AxiosError<ErrorResponse>): any {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
      
        if (axiosError.response) {
            console.error('Axios error with response:', axiosError.response);

            const errorResponse = axiosError.response.data as ErrorResponse;
            
          return  []

        } else if (axiosError.request) {
            console.error('Axios error with no response:', axiosError.request);
            return [];
        } else {
            console.error('Axios error during request setup:', axiosError.message);
            return [];
        }
    } else {
        console.error('An unknown error occured:', error);
        return [];
    }
}

export default projectInviteFetchService;