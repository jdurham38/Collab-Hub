// /hooks/individualProjects/settings/useCollaborators.ts

import { useState, useEffect, useCallback } from 'react';
import { fetchCollaborators } from '@/services/ProjectSettings/adminAccess';
import { Collaborator } from '@/utils/interfaces';
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
      const data = await fetchCollaborators(projectId);
      setCollaborators(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    getCollaborators();
  }, [getCollaborators]);

  return { collaborators, loading, error, refetch: getCollaborators, setCollaborators };
};

export default useCollaborators;
