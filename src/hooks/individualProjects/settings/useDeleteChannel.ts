import { useState } from 'react';
import { deleteChannel } from '@/services/ProjectSettings/deleteChannel';


interface UseDeleteChannelReturn {
  deletingChannelId: string | null;
  deleteChannelById: (projectId: string, channelId: string) => Promise<{success:boolean, message:string}>;
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
      
      return {success: true, message}
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.';
      setError(errorMessage);
      return {success: false, message: errorMessage}
    } finally {
      setDeletingChannelId(null);
    }
  };

  return { deletingChannelId, deleteChannelById, error };
};

export default useDeleteChannel;