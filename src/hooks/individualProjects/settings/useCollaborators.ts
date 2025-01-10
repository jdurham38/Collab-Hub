import { useState, useEffect, useCallback } from 'react';
import { Collaborator } from '@/utils/interfaces';
import { fetchProjectCollaborators } from '@/services/collaboratorService';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface UseCollaboratorsReturn {
  collaborators: Collaborator[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setCollaborators: React.Dispatch<React.SetStateAction<Collaborator[]>>;
}

interface CollaboratorError {
  message: string;
  statusCode?: number;
}

const useCollaborators = (projectId: string): UseCollaboratorsReturn => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getCollaborators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const collaboratorsData = await fetchProjectCollaborators(projectId);
      setCollaborators(collaboratorsData.collaborators);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<CollaboratorError>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to fetch collaborators.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected error has occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      }
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
