// services/unreadCountsService.ts

import axios from 'axios';

interface UnreadCount {
  channel_id: string;
  unread_count: number;
}

export const fetchUnreadCounts = async (
  userId: string,
): Promise<UnreadCount[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/unreadCounts`);
    return response.data.unreadCounts;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to fetch unread counts.';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while fetching unread counts.',
      );
    }
  }
};
