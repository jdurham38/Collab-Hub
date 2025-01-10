import axios, { AxiosError } from 'axios';
import { ProjectInvite } from '@/utils/interfaces';

const API_URL = '/api/project-invites';
const SEND_INVITE_URL = '/api/project-invites/send-invite';
const USER_INVITES_URL = '/api/project-invites/user-invites';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

interface ErrorResponse {
  error: string;
}

export const projectInviteService = {
  createProjectInvite: async (
    project_id: string,
    receiver_id: string,
    sender_id: string,
    expires_at?: Date,
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

  getProjectInviteById: async (
    id: string,
  ): Promise<ApiResponse<ProjectInvite>> => {
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
    userId: string,
  ): Promise<ApiResponse<string>> => {
    console.log('API call params:', { id, status, userId });
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
    status?: string,
  ): Promise<ApiResponse<ProjectInvite[]>> => {
    try {
      const response = await axios.get<ProjectInvite[]>(USER_INVITES_URL, {
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
    userId: string,
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
      console.error('Axios error with response:', axiosError.response);

      const errorResponse = axiosError.response.data as ErrorResponse;
      return {
        data: null,
        error:
          errorResponse?.error ||
          `Error ${axiosError.response.status}: ${axiosError.response.statusText}`,
      };
    } else if (axiosError.request) {
      console.error('Axios error with no response:', axiosError.request);
      return { data: null, error: 'Network error. No response was received.' };
    } else {
      console.error('Axios error during request setup:', axiosError.message);
      return {
        data: null,
        error: `Error during request setup: ${axiosError.message}`,
      };
    }
  } else {
    console.error('An unknown error occured:', error);
    return { data: null, error: 'An unknown error occured.' };
  }
}

export default projectInviteService;
