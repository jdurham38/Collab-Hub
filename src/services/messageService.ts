// File: services/messageService.ts

import axios from 'axios';
import { Message } from '@/utils/interfaces';

/**
 * Fetch messages for a specific project and channel.
 */
export const fetchMessages = async (
  projectId: string,
  channelId: string,
): Promise<Message[]> => {
  try {
    const response = await axios.get(
      `/api/projects/${projectId}/channels/${channelId}/messages`,
    );
    // Directly return the messages array (adjust if your API response is structured differently)
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to fetch messages.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while fetching messages.');
    }
  }
};

/**
 * Send a new message.
 */
export const sendMessage = async (
  projectId: string,
  channelId: string,
  content: string,
  user_id: string, // Use user_id consistently
): Promise<Message> => {
  try {
    const response = await axios.post(
      `/api/projects/${projectId}/channels/${channelId}/messages`,
      {
        content,
        user_id, // Send as user_id
      },
    );
    // Directly return the created message (adjust if needed)
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to send message.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while sending a message.');
    }
  }
};

/**
 * Edit an existing message.
 */
export const editMessage = async (
  messageId: string,
  content: string,
): Promise<Message> => {
  try {
    const response = await axios.put(`/api/messages/${messageId}`, {
      content,
    });
    // Directly return the updated message (adjust if needed)
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to edit message.';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while editing the message.',
      );
    }
  }
};

/**
 * Delete a message.
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await axios.delete(`/api/messages/${messageId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || 'Failed to delete message.';
      throw new Error(errorMessage);
    } else {
      throw new Error(
        'An unexpected error occurred while deleting the message.',
      );
    }
  }
};