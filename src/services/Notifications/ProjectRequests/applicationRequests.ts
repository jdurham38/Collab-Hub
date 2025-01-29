import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api/notifications/projectRequests';

const projectRequestService = {
    fetchProjectRequests: async (userId: string) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/fetch-project-requests`,
                {
                    params: { userId },
                },
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching project requests:', error);
                throw new Error(
                    error.response?.data?.error || 'Failed to fetch project requests',
                );
            } else if (error instanceof Error) {
                console.error('Error fetching project requests:', error);
                throw new Error(error.message || 'Failed to fetch project requests');
            } else {
                console.error('Error fetching project requests:', error);
                throw new Error('Failed to fetch project requests');
            }
        }
    },

    fetchUnreadProjectRequests: async (userId: string) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/fetch-unread-project-requests`,
                {
                    params: { userId },
                },
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching unread project requests:', error);
                throw new Error(
                    error.response?.data?.error ||
                    'Failed to fetch unread project requests',
                );
            } else if (error instanceof Error) {
                console.error('Error fetching unread project requests:', error);
                throw new Error(
                    error.message || 'Failed to fetch unread project requests',
                );
            } else {
                console.error('Error fetching unread project requests:', error);
                throw new Error('Failed to fetch unread project requests');
            }
        }
    },
    markAllAsRead: async (recordIds: string[], userId: string) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/mark-all-read`,
                {
                    recordIds,
                    userId,
                }
            )
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error marking project requests as read:', error);
                throw new Error(
                    error.response?.data?.error ||
                    'Failed to mark project requests as read',
                );
            } else if (error instanceof Error) {
                console.error('Error marking project requests as read:', error);
                throw new Error(
                    error.message || 'Failed to mark project requests as read',
                );
            } else {
                console.error('Error marking project requests as read:', error);
                throw new Error('Failed to mark project requests as read');
            }
        }
    },
    acceptProjectRequest: async (
        projectId: string,
        userId: string,
        requestId: string,
    ) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/accept-project-request`,
                {
                    projectId,
                    userId,
                    requestId,
                },
            );

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error accepting project request:', error);
                throw new Error(
                    error.response?.data?.error || 'Failed to accept project request',
                );
            } else if (error instanceof Error) {
                console.error('Error accepting project request:', error);
                throw new Error(error.message || 'Failed to accept project request');
            } else {
                console.error('Error accepting project request:', error);
                throw new Error('Failed to accept project request');
            }
        }
    },

    declineProjectRequest: async (requestId: string) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/decline-project-request`,
                {
                    requestId,
                },
            );

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error declining project request:', error);
                throw new Error(
                    error.response?.data?.error || 'Failed to decline project request',
                );
            } else if (error instanceof Error) {
                console.error('Error declining project request:', error);
                throw new Error(error.message || 'Failed to decline project request');
            } else {
                console.error('Error declining project request:', error);
                throw new Error('Failed to decline project request');
            }
        }
    },
};

export default projectRequestService;