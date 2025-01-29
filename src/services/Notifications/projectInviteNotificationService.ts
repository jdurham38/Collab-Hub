// services/Notifications/ProjectInvites/projectInviteNotificationService.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api/notifications';

const projectInviteNotificationService = {
  fetchUnreadProjectInvites: async (userId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fetch-unread-project-invites`,
        {
          params: { userId },
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching unread project invites:', error);
        throw new Error(
          error.response?.data?.error ||
          'Failed to fetch unread project invites',
        );
      } else if (error instanceof Error) {
        console.error('Error fetching unread project invites:', error);
        throw new Error(
          error.message || 'Failed to fetch unread project invites',
        );
      } else {
        console.error('Error fetching unread project invites:', error);
        throw new Error('Failed to fetch unread project invites');
      }
    }
  },
  fetchUnreadSentProjectInvites: async (userId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fetch-unread-sent-project-invites`,
        {
          params: { userId },
        },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching unread sent project invites:', error);
        throw new Error(
          error.response?.data?.error ||
          'Failed to fetch unread sent project invites',
        );
      } else if (error instanceof Error) {
        console.error('Error fetching unread sent project invites:', error);
        throw new Error(
          error.message || 'Failed to fetch unread sent project invites',
        );
      } else {
        console.error('Error fetching unread sent project invites:', error);
        throw new Error('Failed to fetch unread sent project invites');
      }
    }
  },
  markAllAsRead: async (recordIds: string[], userId: string) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/mark-all-invites-read`,
        {
          recordIds,
          userId,
        }
      )
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error marking project invites as read:', error);
        throw new Error(
          error.response?.data?.error ||
          'Failed to mark project invites as read',
        );
      } else if (error instanceof Error) {
        console.error('Error marking project invites as read:', error);
        throw new Error(
          error.message || 'Failed to mark project invites as read',
        );
      } else {
        console.error('Error marking project invites as read:', error);
        throw new Error('Failed to mark project invites as read');
      }
    }
  },
  markAllSentAsRead: async (recordIds: string[], userId: string) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/mark-all-sent-invites-read`,
                {
                    recordIds,
                    userId,
                }
            )
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error marking sent project invites as read:', error);
                throw new Error(
                    error.response?.data?.error ||
                    'Failed to mark sent project invites as read',
                );
            } else if (error instanceof Error) {
                console.error('Error marking sent project invites as read:', error);
                throw new Error(
                    error.message || 'Failed to mark sent project invites as read',
                );
            } else {
                console.error('Error marking sent project invites as read:', error);
                throw new Error('Failed to mark sent project invites as read');
            }
        }
    },
};

export default projectInviteNotificationService;