// /hooks/useChannels.ts

import { useState, useEffect } from 'react';
import { fetchChannels } from '@/services/ProjectSettings/deleteChannel';
import { Channel } from '@/utils/interfaces';
import { toast } from 'react-toastify';

interface UseChannelsReturn {
  channels: Channel[];
  loading: boolean;
  error: string | null;
}

const useChannels = (projectId: string): UseChannelsReturn => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getChannels = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchChannels(projectId);
        setChannels(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getChannels();
  }, [projectId]);

  return { channels, loading, error };
};

export default useChannels;
