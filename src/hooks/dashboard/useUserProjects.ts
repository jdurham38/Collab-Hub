import { useEffect, useState } from 'react';
import { getUserProjects } from '@/services/Dashboard/getUserProjects';


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
        const userProjectData = await getUserProjects(userId);
        setProjects(userProjectData);
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
