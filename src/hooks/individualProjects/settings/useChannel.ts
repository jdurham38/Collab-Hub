import { useState, useEffect, useCallback } from 'react';
import { fetchChannels } from '@/services/ProjectSettings/deleteChannel';
import { Channel } from '@/utils/interfaces';
import { toast } from 'react-toastify';

interface UseChannelsReturn {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useChannels = (projectId: string): UseChannelsReturn => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChannels(projectId);
      setChannels(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    getChannels();
  }, [getChannels]);

  return { channels, loading, error, refetch: getChannels };
};

export default useChannels;
