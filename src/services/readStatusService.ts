import axios from 'axios';

export const updateReadStatus = async (
  channelId: string,
  userId: string,
): Promise<void> => {
  try {
    await axios.post(`/api/channels/${channelId}/readStatus`, {
      userId,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to update read status.';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while updating read status.',
      );
    }
  }
};
