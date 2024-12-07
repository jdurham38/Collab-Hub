import { useState, useEffect } from 'react';
import { fetchProjectCollaborators } from '@/services/collaboratorService';
import { User } from '@/utils/interfaces';

const useCollaborators = (projectId: string): User[] => {
  const [allCollaborators, setAllCollaborators] = useState<User[]>([]);

  useEffect(() => {
    const fetchCollaboratorsData = async () => {
      try {
        const collaborators = await fetchProjectCollaborators(projectId);
        setAllCollaborators(collaborators);
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      }
    };

    if (projectId) {
      fetchCollaboratorsData();
    }
  }, [projectId]);

  return allCollaborators;
};

export default useCollaborators;
