

import axios from 'axios';
import { Channel } from '@/utils/interfaces';


  
/**
 * Fetches all channels associated with a specific project.
 * @param projectId - The ID of the project.
 * @returns A promise that resolves to an array of Channel objects.
 * @throws An error if the fetch operation fails.
 */
export const fetchChannels = async (projectId: string): Promise<Channel[]> => {
  try {
    const response = await axios.get(`/api/projects/${projectId}/channels`);
    return response.data.channels;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch channels';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error has occurred');
    }
  }
};

/**
 * Deletes a specific channel and all associated messages.
 * @param projectId - The ID of the project.
 * @param channelId - The ID of the channel to delete.
 * @returns A promise that resolves to a success message.
 * @throws An error if the deletion operation fails.
 */
export const deleteChannel = async (projectId: string, channelId: string): Promise<string> => {
  try {
    const response = await axios.delete(`/api/projects/${projectId}/channels/${channelId}/deleteChannel`);
    return response.data.message; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to delete channel';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error has occurred');
    }
  }
};
