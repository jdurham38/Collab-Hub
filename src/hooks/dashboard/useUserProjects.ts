import { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  createdAt: string;
}

const useUserProjects = (userId: string | undefined) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Initialize as null

  useEffect(() => {
    if (!userId) {
      setLoading(false); // No user ID means no projects to fetch
      return;
    }

    const fetchUserProjects = async () => {
      console.log('Fetching user projects...');

      try {
        const response = await fetch(`/api/projects/user-projects?userId=${userId}`);
        if (!response.ok) {
          const errorMessage = 'Failed to fetch projects';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        const data: Project[] = await response.json();
        setProjects(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId]);

  return { projects, loading, error };
};

export default useUserProjects;
