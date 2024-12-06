// /hooks/useDeleteChannel.ts

import { useState } from 'react';
import { deleteChannel } from '@/services/ProjectSettings/deleteChannel';
import { toast } from 'react-toastify';

interface UseDeleteChannelReturn {
  deletingChannelId: string | null;
  deleteChannelById: (projectId: string, channelId: string) => Promise<void>;
  error: string | null;
}

const useDeleteChannel = (): UseDeleteChannelReturn => {
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteChannelById = async (projectId: string, channelId: string) => {
    setDeletingChannelId(channelId);
    setError(null);
    try {
      const message = await deleteChannel(projectId, channelId);
      toast.success(message);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeletingChannelId(null);
    }
  };

  return { deletingChannelId, deleteChannelById, error };
};

export default useDeleteChannel;
