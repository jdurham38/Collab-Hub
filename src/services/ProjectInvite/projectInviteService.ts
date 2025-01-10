import axios, { AxiosError } from 'axios';
import { ProjectInvite } from '@/utils/interfaces';

const API_URL = '/api/project-invites'; // Base URL
const SEND_INVITE_URL = '/api/project-invites/send-invite';
const USER_INVITES_URL = '/api/project-invites/user-invites'; // added this url

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

// Define type for the Error Response that is being returned from API
interface ErrorResponse {
    error: string;
}

export const projectInviteService = {
    createProjectInvite: async (
        project_id: string,
        receiver_id: string,
        sender_id: string,
        expires_at?: Date
    ): Promise<ApiResponse<ProjectInvite>> => {
        try {
            const response = await axios.post(SEND_INVITE_URL, {
                project_id,
                receiver_id,
                sender_id,
                expires_at,
            });
            return { data: response.data as ProjectInvite, error: null };
        } catch (error) {
            return handleAxiosError(error as AxiosError<ErrorResponse>);
        }
    },

    getProjectInviteById: async (id: string): Promise<ApiResponse<ProjectInvite>> => {
        try {
            const response = await axios.get<ProjectInvite>(`${API_URL}/${id}`);
            return { data: response.data, error: null };
        } catch (error) {
           return handleAxiosError(error as AxiosError<ErrorResponse>);
        }
    },

    updateProjectInvite: async (
        id: string,
        status: string,
        userId: string
    ): Promise<ApiResponse<string>> => {
      console.log("API call params:", { id, status, userId });
        try {
            const response = await axios.patch<string>(`${API_URL}/${id}`, {
                status,
                userId,
            });
            return { data: response.data, error: null };
        } catch (error) {
            return handleAxiosError(error as AxiosError<ErrorResponse>);
        }
    },
    listProjectInvites: async (
        project_id?: string,
        user_id?: string,
        status?: string
    ): Promise<ApiResponse<ProjectInvite[]>> => {
        try {
            const response = await axios.get<ProjectInvite[]>(USER_INVITES_URL, { // Use the user-invites url
                params: {
                    project_id,
                    user_id,
                    status,
                },
            });
            return { data: response.data, error: null };
        } catch (error) {
           return handleAxiosError(error as AxiosError<ErrorResponse>);
        }
    },
     deleteProjectInvite: async (
      id: string,
      userId: string
    ): Promise<ApiResponse<null>> => {
      try {
        await axios.delete(`${API_URL}/${id}`, { data: { userId } });
        return { data: null, error: null };
      } catch (error) {
        return handleAxiosError(error as AxiosError<ErrorResponse>);
      }
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleAxiosError(error: AxiosError<ErrorResponse>): ApiResponse<any> {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (axiosError.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Axios error with response:', axiosError.response);
            // Explicitly cast response.data to the ErrorResponse interface
             const errorResponse = axiosError.response.data as ErrorResponse;
            return { data: null, error: errorResponse?.error || `Error ${axiosError.response.status}: ${axiosError.response.statusText}` };


        } else if (axiosError.request) {
            // The request was made but no response was received
            console.error('Axios error with no response:', axiosError.request);
            return { data: null, error: 'Network error. No response was received.' };

        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Axios error during request setup:', axiosError.message);
            return { data: null, error: `Error during request setup: ${axiosError.message}` };
        }
    } else {
        console.error('An unknown error occured:', error);
        return { data: null, error: 'An unknown error occured.' };
    }
}

export default projectInviteService;