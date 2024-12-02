// File: services/messageService.ts

import axios from 'axios';
import { Message } from '@/utils/interfaces';

/**
 * Fetch messages for a specific project and channel.
 */
export const fetchMessages = async (projectId: string, channelId: string): Promise<Message[]> => {
  try {
    const response = await axios.get(`/api/projects/${projectId}/channels/${channelId}/messages`);
    return response.data.messages;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch messages.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while fetching messages.');
    }
  }
};

/**
 * Send a new message.
 * Returns the created Message object.
 */
export const sendMessage = async (
  projectId: string,
  channelId: string,
  content: string,
  user_id: string
): Promise<Message> => {
  try {
    const response = await axios.post(`/api/projects/${projectId}/channels/${channelId}/messages`, {
      content,
      user_id,
    });
    return response.data.message; // Assuming the API returns the created message
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to send message.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while sending a message.');
    }
  }
};

/**
 * Edit an existing message.
 * Returns the updated Message object.
 */
export const editMessage = async (
  messageId: string,
  content: string
): Promise<Message> => {
  try {
    const response = await axios.put(`/api/messages/${messageId}`, {
      content,
    });
    return response.data.message; // Assuming the API returns the updated message
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to edit message.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while editing the message.');
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
      const errorMessage = error.response?.data?.error || 'Failed to delete message.';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred while deleting the message.');
    }
  }
};
