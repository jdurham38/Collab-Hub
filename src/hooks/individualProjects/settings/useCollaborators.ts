// hooks/individualProjects/settings/useCollaborators.ts

import { useState, useEffect, useCallback } from 'react';
import { Collaborator } from '@/utils/interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';

interface UseCollaboratorsReturn {
  collaborators: Collaborator[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setCollaborators: React.Dispatch<React.SetStateAction<Collaborator[]>>;
}

const useCollaborators = (projectId: string): UseCollaboratorsReturn => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getCollaborators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/projects/${projectId}/collaborators`);
      setCollaborators(response.data.collaborators);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err.message || 'Failed to fetch collaborators.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    getCollaborators();
  }, [getCollaborators]);

  return {
    collaborators,
    loading,
    error,
    refetch: getCollaborators,
    setCollaborators,
  };
};

export default useCollaborators;
