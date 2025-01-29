import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api/notifications/applications';

const applicantRequestService = {
  fetchApplicantProjectRequests: async (userId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fetch-applications-sent`,
        {
          params: { userId },
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching applicant project requests:', error);
        throw new Error(
          error.response?.data?.error ||
            'Failed to fetch applicant project requests',
        );
      } else if (error instanceof Error) {
        console.error('Error fetching applicant project requests:', error);
        throw new Error(
          error.message || 'Failed to fetch applicant project requests',
        );
      } else {
        console.error('Error fetching applicant project requests:', error);
        throw new Error('Failed to fetch applicant project requests');
      }
    }
  },
    fetchUnreadApplicantProjectRequests: async (userId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fetch-unread-applications-sent`,
        {
          params: { userId },
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching unread applicant project requests:', error);
        throw new Error(
          error.response?.data?.error ||
            'Failed to fetch unread applicant project requests',
        );
      } else if (error instanceof Error) {
           console.error('Error fetching unread applicant project requests:', error);
        throw new Error(
          error.message || 'Failed to fetch unread applicant project requests',
        );
      } else {
         console.error('Error fetching unread applicant project requests:', error);
        throw new Error('Failed to fetch unread applicant project requests');
      }
    }
    },
    markAllAsRead: async (requestIds: string[], userId: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/mark-applications-sent-as-read`, {
                requestIds,
                userId
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error marking all as read', error);
                throw new Error(
                    error.response?.data?.error || 'Failed to mark all as read',
                );
            } else if (error instanceof Error) {
                console.error('Error marking all as read', error);
                throw new Error(error.message || 'Failed to mark all as read');
            } else {
                console.error('Error marking all as read', error);
                throw new Error('Failed to mark all as read');
            }
        }
    },
  deleteProjectRequest: async (requestId: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete-request`, {
        params: { requestId },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting project request:', error);
        throw new Error(
          error.response?.data?.error || 'Failed to delete project request',
        );
      } else if (error instanceof Error) {
        console.error('Error deleting project request:', error);
        throw new Error(error.message || 'Failed to delete project request');
      } else {
        console.error('Error deleting project request:', error);
        throw new Error('Failed to delete project request');
      }
    }
  },
};

export default applicantRequestService;