import { useState, useEffect } from 'react';
import { fetchProjectCollaborators } from '@/services/collaboratorService';
import { Collaborator } from '@/utils/interfaces';
import axios, { AxiosError } from 'axios';

export interface UseCollaboratorsResult {
  collaborators: Collaborator[] | null;
  isLoading: boolean;
  error: string | null;
  filteredCollaborators: Collaborator[] | null; // Add filtered collaborators
}

interface CollaboratorError {
  message: string;
  statusCode?: number;
}

const useCollaborators = (
  projectId: string,
  filterText?: string // Add a filterText parameter
): UseCollaboratorsResult => {
  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredCollaborators, setFilteredCollaborators] = useState<
    Collaborator[] | null
  >(null);

  useEffect(() => {
    const fetchCollaboratorsData = async () => {
      setIsLoading(true);
      try {
        const fetchedCollaborators = await fetchProjectCollaborators(projectId);
        setCollaborators(fetchedCollaborators);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<CollaboratorError>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Failed to fetch collaborators';
          setError(errorMessage);
        } else {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'an unexpected error has occurred';
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchCollaboratorsData();
    }
  }, [projectId]);

  // Filter collaborators when filterText changes
  useEffect(() => {
    if (collaborators && filterText) {
      const filtered = collaborators.filter((user) =>
        user.username.toLowerCase().startsWith(filterText.toLowerCase())
      );
      setFilteredCollaborators(filtered);
    } else {
      setFilteredCollaborators(collaborators); // If no filter, show all
    }
  }, [collaborators, filterText]);

  return { collaborators, isLoading, error, filteredCollaborators };
};

export default useCollaborators;