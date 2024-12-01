// services/channelService.ts

import axios from 'axios';

export const fetchChannels = async (projectId: string) => {
  try {
    const response = await axios.get(`/api/projects/${projectId}/channels`);
    return response.data.channels;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch channels.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while fetching channels.');
    }
  }
};

export const addChannel = async (
  projectId: string,
  channelName: string,
  createdBy: string
) => {
  try {
    await axios.post(`/api/projects/${projectId}/channels`, {
      name: channelName.trim(),
      created_by: createdBy,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to add channel.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while adding a channel.');
    }
  }
};
