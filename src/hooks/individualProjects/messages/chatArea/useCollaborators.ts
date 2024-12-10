import { useState, useEffect } from 'react';
import { fetchProjectCollaborators } from '@/services/collaboratorService';
import { Collaborator } from '@/utils/interfaces'; // Import the Collaborator interface

export interface UseCollaboratorsResult {
  collaborators: Collaborator[] | null;
  isLoading: boolean;
  error: string | null;
}

const useCollaborators = (projectId: string): UseCollaboratorsResult => {
  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollaboratorsData = async () => {
      setIsLoading(true);
      try {
        const fetchedCollaborators = await fetchProjectCollaborators(projectId);
        setCollaborators(fetchedCollaborators);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching collaborators:', err);
        setError(err.message || 'An error occurred while fetching collaborators.');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchCollaboratorsData();
    }
  }, [projectId]);

  return { collaborators, isLoading, error };
};

export default useCollaborators;